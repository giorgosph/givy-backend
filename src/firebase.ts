import Logger from "./utils/logger/logger";
import * as admin from "firebase-admin";
// const admin = require("firebase-admin");

/* ----- Types ----- */
type ParamsType = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

/* ----------------- */

export const createFirebaseAdminApp = () => {
  const params: ParamsType = {
    projectId: process.env.FIREBASE_PROJECT_ID as string,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
    privateKey: process.env.FIREBASE_PRIVATE_KEY as string,
  };

  try {
    const privateKey = params.privateKey.replace(/\\n/g, "\n");
    if (admin.apps.length > 0) return admin.app();

    const cert = admin.credential.cert({
      ...params,
      privateKey: privateKey,
    });

    admin.initializeApp({
      credential: cert,
      projectId: params.projectId,
    });

    Logger.debug(`FB App initialized`);
  } catch (err) {
    Logger.error(`Error creating FB Admin App: ${err}`);
  }
};
