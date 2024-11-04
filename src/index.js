import express from "express";
import ocrRoutes from "./modules/ocr/ocr.routes.js";
import gcp from "./config/gcp.config.js";

// setup express server
const app = express();
const port = process.env.PORT || 8081;

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

gcp();

// setup routes
app.get("/", (req, res) => {
  res.status(200).send("Hello World! OCR Document Processor Service");
});

// OCR routes
app.use("/ocr", ocrRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
