import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    // 🔥 บรรทัดสำคัญ
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

    const folderId = req.query.folderId;

    if (!folderId) {
      return res.status(400).json({ error: "Missing folderId" });
    }

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)",
    });

    res.status(200).json({
      files: response.data.files,
    });
  } catch (err) {
    console.error("Drive Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
}
