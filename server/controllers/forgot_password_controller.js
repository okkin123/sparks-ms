const jwt = require("jsonwebtoken");
const dbConnection = require("../config/database");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { sendingMail } = require("../config/mailing");





module.exports = {
  send_code: (req, res) => {
     const verification_code = Math.floor(1000 + Math.random() * 9000);
     const token_expiry = 30;

      dbConnection.query(
      "SELECT * from vw_users WHERE email_address=?",
      [req.body.email_address],
      function (err, data, fields) {
        if (data.length > 0) {
    
            const token = jwt.sign(
              {
                user_id: data[0].user_id,
                code: verification_code.toString(),
              },
              verification_code.toString(),
              {
                expiresIn: token_expiry,
              }
            );

            return res.header("Authorization", `Bearer ${token}`).send({
              status: "SUCCESS",
              email_address: data[0].email_address,
              code: verification_code,
              expiry: token_expiry,
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
  send_email: (req, res) => {
    sendingMail({
      from: "no-reply@example.com",
      to: `${req.body.email_address}`,
      subject: "Account Verification Link",
      text: `Your verification code for password change is: ${req.body.code}`,
    });
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
