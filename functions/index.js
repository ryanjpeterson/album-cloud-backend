// Node modules
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const functions = require("firebase-functions");

// Local files
// const { admin, db } = require("./util/admin");

// Handler imports
const {
  getAlbums,
  getAlbum,
  postAlbum,
  uploadAlbumCover,
  editAlbumInfo,
} = require("./handlers/albums");

// Album handlers
app.get("/", getAlbums);
app.get("/album/:id", getAlbum);

app.post("/post", postAlbum);
app.post("/album/:id/uploadAlbumCover", uploadAlbumCover);
app.post("/album/:id/editAlbumInfo", editAlbumInfo);

// Init server
app.listen(5000, () => {
  console.log(`Listening on 5000`);
});

// Function exports
exports.api = functions.https.onRequest(app);
