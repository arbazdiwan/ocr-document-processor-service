class PubSubMiddlewares {
  constructor() {}

  async interceptAndVerify(req, res, next) {
    try {
      const payload = JSON.parse(
        Buffer.from(req.body.message.data, "base64").toString()
      );
      const body = payload;

      req.body = body;
      const { token } = body;

      if (!token || token !== process.env.OCR_PUB_SUB_TOKEN) {
        console.log("Token verification failed");
        return res.status(401).send();
      }
      console.log("Token verification passed");

      return next();
    } catch (e) {
      console.log("error in verifyPuSub(): ", e);
      return res.status(500).send();
    }
  }
}

export default new PubSubMiddlewares();
