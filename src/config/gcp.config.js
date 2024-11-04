import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const gcp = () => {
  console.log("initializing gcp");
  if (!admin.apps.length > 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: "service_account",
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
        private_key: process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_PRIVATE_KEY,
        client_email: process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_CLIENT_EMAIL,
      }),
      storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
      databaseURL: process.env.GOOGLE_CLOUD_FIREBASE_DATABASE_URL,
    });
  }
  const auth = admin.auth();
  const firestore = admin.firestore();
  const storage = admin.storage();
  const { FieldValue, Timestamp } = admin.firestore;
  return { auth, firestore, storage, FieldValue, Timestamp };
};

export default gcp;
