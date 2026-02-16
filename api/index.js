import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import { google } from "googleapis";

const app = express();

app.use(cors({ origin: true }));

const BASE_URL =
  process.env.BASE_URL || "https://your-vercel-domain.vercel.app";

if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT");
}

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

/* ----------------------- */
/* List folders / images   */
/* ----------------------- */
app.get("/api/photos/:folderId", async (req, res) => {
  try {
    const { folderId } = req.params;

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)",
    });

    const files = response.data.files.map((file) => {
      const isFolder = file.mimeType === "application/vnd.google-apps.folder";

      return {
        id: file.id,
        name: file.name,
        type: isFolder ? "folder" : "image",
      };
    });

    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default serverless(app);
