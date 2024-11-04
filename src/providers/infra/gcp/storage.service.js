import { Storage } from "@google-cloud/storage";
import gcp from "../../../config/gcp.config.js";

class GcpStorageService {
  constructor(bucketName, gcpService) {
    this.gcpService = gcp;
    this.bucketName =
      bucketName?.trim() || process.env.GOOGLE_CLOUD_BUCKET_NAME;
    this.storage = new Storage();
    this.bucket = this.storage.bucket(this.bucketName);
  }

  getFutureDateSignedUrl() {
    // add 7 days to current date and return "MM-dd-yyyy"
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return futureDate.toISOString().split("T")[0];
  }

  async getSignedUrl(fileName) {
    const [signedUrl] = await this.gcpService()
      .storage.bucket(this.bucketName)
      .file(fileName)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: this.getFutureDateSignedUrl(),
      });
    return signedUrl;
  }

  async getFileFromStorage(fileName) {
    try {
      const [file] = await this.bucket.file(fileName).download();
      return { file, success: true };
    } catch (err) {
      console.error(
        "getFileFromStorage(): Error getting file from GCP Storage"
      );
      console.error(err);
      return { success: false, error: err, message: err.message };
    }
  }
}

export default GcpStorageService;
