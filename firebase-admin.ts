import { initializeApp, getApps, getApp, App, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app: App;

if (getApps().length === 0) {
  try {
    // Use environment variables for Firebase Admin SDK
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    };

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    
    console.log("✅ Firebase Admin SDK initialized successfully with environment variables");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
} else {
  app = getApp();
}

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };