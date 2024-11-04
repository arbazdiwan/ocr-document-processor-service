// a class that provides uniform interface for cloud services

import GcpStorageService from "./storage.service.js";
import gcp from "../../../config/gcp.config.js";

class GcpService {
  constructor(bucketName) {
    this.storage = new GcpStorageService(bucketName, gcp);
  }
}

export default GcpService;
