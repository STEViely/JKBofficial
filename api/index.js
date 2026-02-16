const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const serverless = require("serverless-http");

const app = express();

/* ==============================
   CORS
============================== */
app.use(
  cors({
    origin: true,
  }),
);

/* ==============================
   Base URL
============================== */
const BASE_URL = process.env.BASE_URL || "";

/* ==============================
   Google Drive Setup (Vercel Safe)
============================== */

// ตรวจสอบ ENV
if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT environment variable");
}

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

/* ==============================
   Health Check
============================== */
app.get("/", (req, res) => {
  res.send("🚀 Backend running");
});

/* ==============================
   List folders OR images
============================== */
app.get("/api/photos/:folderId", async (req, res) => {
  try {
    const { folderId } = req.params;

    const folderMeta = await drive.files.get({
      fileId: folderId,
      fields: "name",
    });

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
        previewUrl: !isFolder ? `/api/preview/${file.id}` : null,
        downloadUrl: !isFolder ? `/api/download/${file.id}` : null,
      };
    });

    res.json({
      folderName: folderMeta.data.name,
      files,
    });
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   Preview image
============================== */
app.get("/api/preview/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const meta = await drive.files.get({
      fileId,
      fields: "mimeType",
    });

    res.setHeader("Content-Type", meta.data.mimeType);

    const file = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" },
    );

    file.data.pipe(res);
  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   Download image
============================== */
app.get("/api/download/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const meta = await drive.files.get({
      fileId,
      fields: "name, mimeType",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${meta.data.name}"`,
    );
    res.setHeader("Content-Type", meta.data.mimeType);

    const file = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" },
    );

    file.data.pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   Debug Route
============================== */
app.get("/api/debug/list-export", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: `'16BXIEtTdZV35udjnxYGSIkjQkQLKYGXu' in parents`,
      fields: "files(id, name, mimeType)",
    });

    res.json(response.data.files);
  } catch (err) {
    console.error("DEBUG LIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   Export for Vercel
============================== */
module.exports = serverless(app);
