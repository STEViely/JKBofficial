import express from "express";
import serverless from "serverless-http";

const app = express();

app.get("/api/photos", (req, res) => {
  res.json({ message: "Photos API working 🚀" });
});

export default serverless(app);
