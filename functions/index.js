// Node modules
const functions = require("firebase-functions");
const FBAuth = require("./util/fbAuth");

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Local files
const { admin, db } = require("./util/admin");

// Handler imports
const {
  getAlbums,
  getAlbum,
  postAlbum,
  uploadAlbumCover,
  editAlbumInfo,
} = require("./handlers/albums");

const { login } = require("./handlers/users");

// Album handlers
app.get("/", getAlbums);
app.get("/album/:id", getAlbum);

app.post("/login", login);
app.post("/post", FBAuth, postAlbum);
app.post("/album/:id/uploadAlbumCover", uploadAlbumCover);
app.post("/album/:id/editAlbumInfo", editAlbumInfo);

// Init server
app.listen(5000, () => {
  console.log(`Listening on 5000`);
});

// Function exports
exports.api = functions.https.onRequest(app);
