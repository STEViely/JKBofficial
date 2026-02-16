import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const { folderId } = req.query;

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({
      version: "v3",
      auth,
    });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/'`,
      fields: "files(id, name, webViewLink, webContentLink)",
    });

    res.status(200).json(response.data.files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
