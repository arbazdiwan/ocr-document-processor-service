import express from "express";
import ocrController from "./ocr.controller.js";
import pubsubMiddleware from "../../common/middlewares/pubsub.middleware.js";

const router = express.Router();

router.post(
  "/",
  pubsubMiddleware.interceptAndVerify,
  ocrController.processDocument
);

export default router;
