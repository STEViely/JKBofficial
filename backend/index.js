const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const path = require("path");

const app = express();
const PORT = 4000;

/* ==============================
   CORS
============================== */

app.use(
  cors({
    origin: ["http://localhost:8080"],
  }),
);

/* ==============================
   Google Drive Setup
============================== */

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "service-account.json"),
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
   ✅ FIXED: Now returns folderName + files
============================== */

app.get("/api/photos/:folderId", async (req, res) => {
  try {
    const { folderId } = req.params;

    // 🔥 1. ดึงชื่อโฟลเดอร์ก่อน
    const folderMeta = await drive.files.get({
      fileId: folderId,
      fields: "name",
    });

    // 🔥 2. ดึงไฟล์ในโฟลเดอร์
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
        previewUrl: !isFolder
          ? `http://localhost:${PORT}/api/preview/${file.id}`
          : null,
        downloadUrl: !isFolder
          ? `http://localhost:${PORT}/api/download/${file.id}`
          : null,
      };
    });

    // ✅ ส่งกลับเป็น object แทน array
    res.json({
      folderName: folderMeta.data.name,
      files: files,
    });
  } catch (err) {
    console.error("List error:", err.message);
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
    console.error("Preview error:", err.message);
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
    console.error("Download error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   Debug Route
============================== */

app.get("/debug/list-export", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: `'16BXIEtTdZV35udjnxYGSIkjQkQLKYGXu' in parents`,
      fields: "files(id, name, mimeType)",
    });

    res.json(response.data.files);
  } catch (err) {
    console.error("DEBUG LIST ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ==============================
   Start Server
============================== */

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
