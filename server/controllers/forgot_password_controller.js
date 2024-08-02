const jwt = require("jsonwebtoken");
const dbConnection = require("../config/database");
const crypto = require("crypto");
module.exports = {
  // send_code: (req, res) => {
  //   const hex = crypto.randomBytes(4).toString("hex");
  //   const code = parseInt(hex, 16);

  //   res.send({ status: "SENT", code: code });
  // },

  send_code: (req, res) => {
    dbConnection.query(
      "SELECT * from vw_users WHERE email_address=?",
      [req.body.email_address],
      function (err, data, fields) {
        if (data.length > 0) {
          const token = jwt.sign(
            {
              user_id: data[0].user_id,
              code: "1234",
            },
            "1234",
            {
              expiresIn: "1h",
            }
          );

          return res.header("Authorization", `Bearer ${token}`).send({
            status: "SUCCESS",
            token: token,
          });
        } else {
          res.status(201).json({
            status: "ERROR",
            message: "Email Address is not registered!",
          });
        }
      }
    );
  },
  verify_code: (req, res) => {
    console.log(req.user);
  },
};
