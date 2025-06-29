var jwt = require("jsonwebtoken");
require('dotenv').config(); 
const jwt_secret = process.env.JWT_SECRET;
const fetchuser = (req, res, next) => {
  //get the user from jwt token and add id to req object
  const token = req.header("authtoken");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, jwt_secret);
    req.user = data.user;
    next();
  }
  catch (error) {
    return res.status(400).json({ errors: "Please authenticate using a valid token"});
  }
};

module.exports = fetchuser;
