import admin, { auth as adminAuth, storage } from 'firebase-admin';
import { type ServiceAccount } from 'firebase-admin';import dotenv from 'dotenv';

import { Bucket } from '@google-cloud/storage';

dotenv.config();

function getEnv(varName: string): string {
  const value = process.env[varName];
  if (!value) throw new Error(`${varName} is not set`);
  return value;
}

const serviceAccount: ServiceAccount = {
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  clientEmail: getEnv('FIREBASE_CLIENT_EMAIL'),
  privateKey: getEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  });
}

export const db = admin.firestore();
export const auth: admin.auth.Auth = admin.auth();
type BucketType = ReturnType<typeof admin.storage.prototype.bucket>;
export const bucket: BucketType = admin.storage().bucket();export default admin;
