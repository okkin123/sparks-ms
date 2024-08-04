const jwt = require("jsonwebtoken");
const dbConnection = require("../config/database");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { sendingMail } = require("../config/mailing");


const verification_code = Math.floor(1000 + Math.random() * 9000);

module.exports = {
  send_code: (req, res) => {
      dbConnection.query(
      "SELECT * from vw_users WHERE email_address=?",
      [req.body.email_address],
      function (err, data, fields) {
        if (data.length > 0) {
            sendingMail({
              from: "no-reply@example.com",
              to: `${data[0].email_address}`,
              subject: "Account Verification Link",
              text: `Your verification code for password change is: ${verification_code}`,
            });
            const token = jwt.sign(
              {
                user_id: data[0].user_id,
                code: verification_code.toString(),
              },
              verification_code.toString(),
              {
                expiresIn: "1h",
              }
            );

            return res.header("Authorization", `Bearer ${token}`).send({
              status: "SUCCESS",
              token: token,
              message: "Please check your email and enter the pin code above!"
            });
        } else {

          res.send({
            status: "ERROR",
            message: "Email Address is not registered!",
          });
        }
      }
    );
  },
  user_data: (req, res) => {

    res.send({
      status: "SUCCESS",
      user: req.user
    })
  },
  change_password: (req, res) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(req.body.password, salt, function (err, hash) {
        dbConnection.query("UPDATE tbl_users SET password=? WHERE user_id=?",
          [hash, req.body.user_id], function(err, data, fields)
          {
            if (err) {
              res.send({
                status: "ERROR",
                message: err.sqlMessage,
              });
            } else {
              res.send({
                status: "SUCCESS",
                message: "Your password is changed!",
              });
            }
          }
        )
      })})
    }
};
