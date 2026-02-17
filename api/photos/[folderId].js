import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const { folderId } = req.query;

    if (!folderId) {
      return res.status(400).json({ error: "Missing folderId" });
    }

    // ✅ ใช้ Service Account JSON จาก Environment Variable
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // ✅ ดึงชื่อโฟลเดอร์
    const folderMeta = await drive.files.get({
      fileId: folderId,
      fields: "name",
    });

    const folderName = folderMeta.data.name || "Event Gallery";

    // ✅ ดึงไฟล์ในโฟลเดอร์
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)",
    });

    const files = (response.data.files || []).map((file) => {
      const isFolder = file.mimeType === "application/vnd.google-apps.folder";

      return {
        id: file.id,
        name: file.name,
        type: isFolder ? "folder" : "image",

        // 👇 สำหรับหน้า Gallery
        previewUrl: !isFolder
          ? `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`
          : null,

        downloadUrl: !isFolder
          ? `https://drive.google.com/uc?export=download&id=${file.id}`
          : null,
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
