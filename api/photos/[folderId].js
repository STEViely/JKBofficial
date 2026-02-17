import { google } from "googleapis";

export default async function handler(req, res) {
  const { folderId } = req.query;

  if (!folderId) {
    return res.status(400).json({ error: "Missing folderId" });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({
      version: "v3",
      auth,
    });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id,name,mimeType,createdTime)",
      orderBy: "createdTime desc",
    });

    const files = response.data.files.map((file) => {
      const isFolder = file.mimeType === "application/vnd.google-apps.folder";

      return {
        id: file.id,
        name: file.name,
        createdTime: file.createdTime,
        type: isFolder ? "folder" : "file",
        previewUrl: isFolder
          ? null
          : `https://drive.google.com/thumbnail?id=${file.id}&sz=w1200`,
        downloadUrl: isFolder
          ? null
          : `https://drive.google.com/uc?export=download&id=${file.id}`,
      };
    });

    return res.status(200).json({
      folderId,
      files,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch files" });
  }
}
