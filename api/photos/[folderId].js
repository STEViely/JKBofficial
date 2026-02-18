import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const { folderId, fileId, download } = req.query;

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      return res.status(500).json({
        error: "Missing GOOGLE_SERVICE_ACCOUNT_JSON",
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    /* ================= DOWNLOAD FILE ================= */

    if (download && fileId) {
      const fileMeta = await drive.files.get({
        fileId,
        fields: "name, mimeType",
      });

      const fileName = fileMeta.data.name || "download";
      const mimeType = fileMeta.data.mimeType || "application/octet-stream";

      const fileStream = await drive.files.get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "stream" }
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Type", mimeType);

      fileStream.data.pipe(res);
      return;
    }

    /* ================= FETCH FOLDER ================= */

    if (!folderId) {
      return res.status(400).json({ error: "Missing folderId" });
    }

    // ดึงชื่อโฟลเดอร์
    const folderMeta = await drive.files.get({
      fileId: folderId,
      fields: "name",
    });

    const folderName = folderMeta.data.name || "Event Gallery";

    /* ========= FIX: Pagination ดึงครบทุกไฟล์ ========= */

    let allFiles = [];
    let pageToken = null;

    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields:
          "nextPageToken, files(id, name, mimeType, createdTime)",
        orderBy: "createdTime desc",
        pageSize: 1000,
        pageToken: pageToken || undefined,
      });

      allFiles = allFiles.concat(response.data.files || []);
      pageToken = response.data.nextPageToken;
    } while (pageToken);

    /* ========= แปลงข้อมูลให้ frontend ========= */

    const files = allFiles
      .filter((file) => file.mimeType?.startsWith("image/")) // เอาเฉพาะรูปจริง ๆ
      .map((file) => {
        return {
          id: file.id,
          name: file.name,
          type: "image",
          createdTime: file.createdTime || null,

          previewUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`,

          downloadUrl: `/api/photos/${folderId}?download=1&fileId=${file.id}`,
        };
      });

    return res.status(200).json({
      folderName,
      files,
    });
  } catch (error) {
    console.error("Drive API error:", error);
    return res.status(500).json({
      error: "Failed to fetch data",
      details: error.message,
    });
  }
}
