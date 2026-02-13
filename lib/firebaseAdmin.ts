import * as admin from 'firebase-admin';

// This prevents Next.js from accidentally initializing the Admin SDK twice during development
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // This replace function is a lifesaver—it fixes formatting issues with newlines in the private key!
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
