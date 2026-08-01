"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminFirestore = getAdminFirestore;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
function getAdminFirestore() { const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || (process.env.FIRESTORE_EMULATOR_HOST ? 'abp-emulator' : undefined); if (!projectId)
    throw new Error('GCLOUD_PROJECT or FIREBASE_PROJECT_ID is required outside the Firebase emulator.'); if (!(0, app_1.getApps)().length)
    (0, app_1.initializeApp)(process.env.FIRESTORE_EMULATOR_HOST ? { projectId } : { credential: (0, app_1.applicationDefault)(), projectId }); return (0, firestore_1.getFirestore)(); }
