import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const { folderId } = req.query;

    if (!folderId) {
      return res.status(400).json({ error: "Missing folderId" });
    }

    /* ================= AUTH ================= */

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      return res
        .status(500)
        .json({ error: "Missing GOOGLE_SERVICE_ACCOUNT_JSON" });
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    // 🔥 กันปัญหา private_key มี \n
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({
      version: "v3",
      auth,
    });

    /* ================= FOLDER META ================= */

    const folderMeta = await drive.files.get({
      fileId: folderId,
      fields: "name",
    });

    const folderName = folderMeta.data.name || "Event Gallery";

    /* ================= FILE LIST ================= */

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, createdTime)",
      orderBy: "createdTime desc", // 🔥 ใหม่สุดก่อน
      pageSize: 1000, // 🔥 รองรับไฟล์เยอะ
    });

    const files =
      response.data.files?.filter(
        (file) => file.mimeType && file.mimeType.startsWith("image/"),
      ) || [];

    const formattedFiles = files.map((file) => ({
      id: file.id,
      name: file.name,
      type: "image",
      createdTime: file.createdTime,

      // 🔥 โหลดเร็วกว่า view link
      previewUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1200`,

      // 🔥 บังคับดาวน์โหลด ไม่เด้งเข้า Drive
      downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
    }));

    /* ================= CACHE ================= */

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");

    return res.status(200).json({
      folderName,
      files: formattedFiles,
    });
  } catch (error) {
    console.error("Drive API error:", error);

    return res.status(500).json({
      error: "Failed to fetch data",
      details: error?.message || "Unknown error",
    });
  }
}
