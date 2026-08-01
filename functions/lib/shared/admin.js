"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminFirestore = getAdminFirestore;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
function getAdminFirestore() { if (!(0, app_1.getApps)().length)
    (0, app_1.initializeApp)({ credential: (0, app_1.applicationDefault)(), projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID }); return (0, firestore_1.getFirestore)(); }
