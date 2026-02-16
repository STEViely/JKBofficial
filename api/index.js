const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.get("/api/photos", (req, res) => {
  res.json({ message: "Photos API working 🚀" });
});

module.exports = serverless(app);
