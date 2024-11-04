import GcpService from "../../providers/infra/gcp/gcp.service.js";
import { createWorker } from "tesseract.js";
import { parsePanCardData } from "./ocr.utils.js";
import gcp from "../../config/gcp.config.js";

class OcrService {
  constructor() {
    this.gcpService = new GcpService();
  }

  async getOcrRequestData(requestId) {
    const { firestore } = gcp();
    const ocrRequestsCollection = firestore.collection("ocr-requests");
    const ocrRequest = await ocrRequestsCollection.doc(requestId).get();
    return ocrRequest.data();
  }

  async updateOcrRequest(requestId, data) {
    const { firestore } = gcp();
    const ocrRequestsCollection = firestore.collection("ocr-requests");
    await ocrRequestsCollection.doc(requestId).update(data);
  }

  async processDocument(reqBody) {
    console.log("\nprocessDocument() \nocrRequestId: ", reqBody?.ocrRequestId);

    const ocrRequestData = await this.getOcrRequestData(reqBody?.ocrRequestId);
    console.log("ocrRequestData", ocrRequestData);

    const signedUrl = await this.gcpService.storage.getSignedUrl(
      ocrRequestData?.fileName
    );
    console.log("signedUrl", signedUrl);
    const result = await this.recognizeFromUrl(signedUrl);

    console.log("result", result?.data?.split("\n"));

    // TODO: extract parsing logic to a generic function
    const parsedResult = parsePanCardData(result?.data?.split("\n"));
    console.log("parsedResult", parsedResult);

    // TODO: update ocr request status
    await this.updateOcrRequest(reqBody?.ocrRequestId, {
      status: parsedResult?.data?.fullName?.length > 0 ? "COMPLETED" : "FAILED",
      ocrData: parsedResult,
      completedAt: new Date(),
    });

    return {
      success: true,
      message: "Document processed successfully",
      data: parsedResult,
    };
  }

  async getFileFromStorage(fileName) {
    // read file from gcp storage
    const response = await this.gcpService.storage.getFileFromStorage(fileName);
    return response;
  }

  async recognizeFromUrl(fileUrl) {
    try {
      // do ocr on the file
      const worker = await createWorker("eng");
      const ret = await worker.recognize(fileUrl);

      await worker.terminate();

      return {
        success: true,
        message: "OCR completed successfully",
        data: ret?.data?.text,
      };
    } catch (err) {
      console.error("recognizeFromUrl(): Error recognizing from url");
      console.error(err);
      return { success: false, error: err, message: err.message };
    }
  }
}

export default new OcrService();
