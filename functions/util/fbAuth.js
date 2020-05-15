const { admin, db } = require("../util/admin");

module.exports = (req, res, next) => {
  let FBIdToken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    FBIdToken = req.headers.authorization.split("Bearer ")[1];
    admin
      .auth()
      .verifyIdToken(FBIdToken)
      .then((decodedToken) => {
        console.log(decodedToken);
      })
      .then(() => {
        return next();
      })
      .catch((err) => {
        return res.status(403).json({ error: err.code });
      });
  } else {
    return res.status(403).json({ error: "You are not authorized!" });
  }
};
