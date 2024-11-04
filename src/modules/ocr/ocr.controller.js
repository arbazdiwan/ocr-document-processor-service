import ocrService from "./ocr.service.js";

class OcrController {
  constructor() {}

  async processDocument(req, res) {
    const reqBody = req.body;
    try {
      if (!reqBody?.fileName) {
        return res.status(400).json({ error: "No document provided" });
      }

      const result = await ocrService.processDocument(reqBody);
      if (!result?.success) {
        return res.status(500).json({ error: result?.message || "Failed" });
      }
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in OCR upload:", error);
      res.status(500).json({ error: "Failed to process document" });
    }
  }
}

export default new OcrController();
