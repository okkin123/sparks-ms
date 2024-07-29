const dbConnection = require("../config/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

module.exports = {
  findEmail: (req, res) => {
    dbConnection.query(
      "SELECT * from vw_users WHERE email_address=?",
      [req.body.email_address],
      function (err, data, fields) {
        if (err) console.log(err);
        else if (data.length != 0) {
          res.send({
            status: "ERROR",
            message: "Email Address is already taken!",
          });
        } else {
          res.status(201).json({
            status: "SUCCESS",
            message: "Email Address is not taken yet!",
          });
        }
      }
    );
  },
  registerUser: (req, res) => {
    dbConnection.query(
      "SELECT token_id from tbl_user_tokens WHERE token=? AND status='available'",
      [req.body.token],
      function (err, data1, fields) {
        if (err) console.log(err);
        else if (data1.length == 0)
          res.send({
            status: "ERROR",
            message: "Invalid Token!",
          });
        else
          bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(req.body.password, salt, function (err, hash) {
              dbConnection.query(
                "INSERT INTO tbl_users(firstname, lastname, email_address, password, user_token_id) VALUES(?,?,?,?,?)",
                [
                  req.body.firstname,
                  req.body.lastname,
                  req.body.email_address,
                  hash,
                  data1[0].token_id,
                ],
                function (err, data2, fields) {
                  if (err) {
                    res.send({
                      status: "ERROR",
                      message: err.sqlMessage,
                    });
                  } else {
                    dbConnection.query(
                      "UPDATE tbl_user_tokens SET status='not available' WHERE token_id=?",
                      [data1[0].token_id],
                      function (err, data3, fields) {}
                    );
                    res.status(201).json({
                      status: "SUCCESS",
                      message: "You are registered sucessfully!",
                    });
                  }
                }
              );
            });
          });
      }
    );
  },
  loginUser: (req, res) => {
    try {
      dbConnection.query(
        "SELECT * from vw_users WHERE email_address=?",
        [req.body.email_address],
        function (err, data, fields) {
          if (data.length > 0) {
            bcrypt.compare(
              req.body.password,
              data[0].password,
              function (err, result) {
                if (!result) {
                  return res.send({
                    status: "ERROR",
                    message: "Invalid Password!",
                  });
                } else {
                  const token = jwt.sign(
                    {
                      userId: data[0].user_id,
                      userEmail: data[0].email_address,
                    },
                    "lovekonikz",
                    {
                      expiresIn: "1h",
                    }
                  );

                  return res.status(200).json({
                    status: "SUCCESS",
                    name: data[0].fullname,
                    email: data[0].email_address,
                    token: token,
                  });
                }
              }
            );
          } else {
            return res.send({
              status: "ERROR",
              message: "Email Address not Found!",
            });
          }
        }
      );
    } catch (error) {
      res.send({ error: "Login failed!" });
    }
  },
};
