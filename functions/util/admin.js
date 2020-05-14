const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://album-cloud-8c72f.firebaseio.com",
});

const db = admin.firestore();

module.exports = { admin, db };
