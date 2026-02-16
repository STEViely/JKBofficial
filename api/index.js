import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      "\n",
    );

    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({
      version: "v3",
      auth,
    });

    const { folderId } = req.query;

    if (!folderId) {
      return res.status(400).json({ error: "Missing folderId" });
    }

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)",
    });

    const files = response.data.files || [];

    // 🔥 แปลงข้อมูลให้ frontend ใช้ได้เลย
    const formatted = files.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.mimeType.includes("folder") ? "folder" : "image",
      previewUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
    }));

    res.status(200).json({
      folderName: "Event Gallery",
      files: formatted,
    });
  } catch (err) {
    console.error("Drive Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
}
