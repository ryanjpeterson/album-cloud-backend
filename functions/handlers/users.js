const { admin, db } = require("../util/admin");
const firebase = require("firebase");
const config = require("../util/config");

firebase.initializeApp(config);

exports.login = (req, res) => {
  const { email, password } = req.body;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      return res.status(403).json({ error: err.code });
    });
};
