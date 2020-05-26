const { admin, db } = require("../util/admin");
const { parseGenres } = require("../validators/validators");
const config = require("../util/config");

const Busboy = require("busboy");
const path = require("path");
const fs = require("fs");
const os = require("os");

exports.getAlbums = async (req, res) => {
  await db
    .collection("albums")
    .get()
    .then((querySnapshot) => {
      let albums = [];
      querySnapshot.forEach((doc) => {
        albums.push({ id: doc.id, ...doc.data() });
      });
      console.log("Albums sent");
      return res.status(200).send(albums);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

exports.getAlbum = (req, res) => {
  let albumData = {};

  db.doc(`/albums/${req.params.id}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        albumData = doc.data();
        albumData.id = doc.id;
        console.log(`Got document: ${doc.id}`);
        return res.status(200).send(albumData);
      } else {
        return res.status(404).send("Album not found!");
      }
    })
    .catch((err) => {
      res.status(400).send(`Error: ${err}`);
    });
};

exports.postAlbum = (req, res) => {
  let { artist, album, year, genres, comment } = req.body;
  console.log(req.body);

  genres = parseGenres(genres);

  const newPost = {
    artist,
    album,
    year,
    genres,
    comment,
    albumCover:
      "https://firebasestorage.googleapis.com/v0/b/album-cloud-8c72f.appspot.com/o/default-artwork.png?alt=media&token=6773eb47-f36f-477f-b817-8992f11933e4",
    dateAdded: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  };

  db.collection("albums")
    .add(newPost)
    .then((docRef) => {
      res.status(201).json({
        message: `You added ${album} by ${artist} to the database!`,
        newPostId: docRef.id,
      });
    })
    .catch((err) => res.status(400).send(err));
};

exports.editAlbumInfo = (req, res) => {
  const { id, artist, album, year, comment, albumCover } = req.body;
  let genres;

  if (Array.isArray(req.body.genres)) {
    genres = req.body.genres;
  } else {
    genres = parseGenres(req.body.genres);
  }

  const albumInfo = {
    artist,
    album,
    year,
    comment,
    genres,
    albumCover,
    dateUpdated: new Date().toISOString(),
  };

  db.doc(`/albums/${id}`)
    .update(albumInfo)
    .then(() => {
      return res
        .status(201)
        .json({ message: "Album info successfully edited!" });
    })
    .catch((err) => {
      return res.status(400).json({ err });
    });
};

exports.uploadAlbumCover = (req, res) => {
  const busboy = new Busboy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};
  let albumCover;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res
        .status(400)
        .json({ error: "Wrong file type. Please upload a JPEG or PNG file." });
    }
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    imageFileName = `${Math.round(
      Math.random() * 1000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket(config.storageBucket)
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        albumCover = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/albums/${req.params.id}`).update({
          albumCover: albumCover,
          dateUpdated: new Date().toISOString(),
        });
      })
      .then(() => {
        return res.json({
          message: "Image uploaded successfully",
          imageUrl: albumCover,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ error: err.code });
      });
  });

  req.pipe(busboy);
};

exports.deleteAlbum = (req, res) => {
  const document = db.doc(`/albums/${req.params.id}`);

  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        res.status(404).json({ error: "ID not found! " });
      }

      return document.delete();
    })
    .then(() => {
      return res.json({ message: "Album entry deleted! " });
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
};
