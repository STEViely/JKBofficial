import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Storage } from "@google-cloud/storage";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());

// Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucketName = process.env.GCS_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

// Test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

// Get signed URL for image
app.get("/api/photos/:id", async (req, res) => {
  try {
    const fileName = req.params.id;
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: "File not found" });
    }

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 5, // 5 นาที
    });

    res.json({ url });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
