// import { google } from "googleapis";

// export default async function handler(req, res) {
//   try {
//     const { folderId, fileId, download } = req.query;

//     const auth = new google.auth.GoogleAuth({
//       credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
//       scopes: ["https://www.googleapis.com/auth/drive.readonly"],
//     });

//     const drive = google.drive({ version: "v3", auth });

//     /* ================= DOWNLOAD FILE ================= */

//     if (download && fileId) {
//       const fileMeta = await drive.files.get({
//         fileId,
//         fields: "name, mimeType",
//       });

//       const fileName = fileMeta.data.name;
//       const mimeType = fileMeta.data.mimeType;

//       const fileStream = await drive.files.get(
//         {
//           fileId,
//           alt: "media",
//         },
//         { responseType: "stream" },
//       );

//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename="${fileName}"`,
//       );
//       res.setHeader("Content-Type", mimeType);

//       fileStream.data.pipe(res);
//       return;
//     }

//     /* ================= FETCH FOLDER ================= */

//     if (!folderId) {
//       return res.status(400).json({ error: "Missing folderId" });
//     }

//     const folderMeta = await drive.files.get({
//       fileId: folderId,
//       fields: "name",
//     });

//     const folderName = folderMeta.data.name || "Event Gallery";

//     const response = await drive.files.list({
//       q: `'${folderId}' in parents and trashed = false`,
//       fields: "files(id, name, mimeType, createdTime)",
//       orderBy: "createdTime desc",
//     });

//     const files = (response.data.files || []).map((file) => {
//       const isFolder = file.mimeType === "application/vnd.google-apps.folder";

//       return {
//         id: file.id,
//         name: file.name,
//         type: isFolder ? "folder" : "image",
//         createdTime: file.createdTime || null,

//         previewUrl: !isFolder
//           ? `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`
//           : null,

//         // 👇 เปลี่ยนมาใช้ API ตัวเอง
//         downloadUrl: !isFolder
//           ? `/api/photos/${folderId}?download=1&fileId=${file.id}`
//           : null,
//       };
//     });

//     return res.status(200).json({
//       folderName,
//       files,
//     });
//   } catch (error) {
//     console.error("Drive API error:", error);
//     return res.status(500).json({
//       error: "Failed to fetch data",
//       details: error.message,
//     });
//   }
// }

import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const { folderId, download, fileId } = req.query;
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "100");

    if (!folderId) {
      return res.status(400).json({ error: "Missing folderId" });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    /* ================= DOWNLOAD MODE ================= */

    if (download && fileId) {
      const fileMeta = await drive.files.get({
        fileId,
        fields: "name, mimeType",
      });

      const fileStream = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileMeta.data.name}"`
      );
      res.setHeader("Content-Type", fileMeta.data.mimeType);

      fileStream.data.pipe(res);
      return;
    }

    /* ================= LIST MODE ================= */

    const folderMeta = await drive.files.get({
      fileId: folderId,
      fields: "name",
    });

    let allFiles = [];
    let nextPageToken = null;

    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "nextPageToken, files(id, name, mimeType, createdTime)",
        orderBy: "createdTime desc",
        pageSize: 1000,
        pageToken: nextPageToken || undefined,
      });

      allFiles = [...allFiles, ...(response.data.files || [])];
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    const imageFiles = allFiles.filter(
      (file) => file.mimeType !== "application/vnd.google-apps.folder"
    );

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = imageFiles.slice(start, end);

    const files = paginated.map((file) => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime || null,
      previewUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
      downloadUrl: `/api/photos/${folderId}?download=1&fileId=${file.id}`,
    }));

    return res.status(200).json({
      folderName: folderMeta.data.name,
      files,
      hasMore: end < imageFiles.length,
      nextPage: page + 1,
    });

  } catch (error) {
    console.error("Drive API Error:", error);
    return res.status(500).json({
      error: "Server error",
      message: error.message,
    });
  }
}

