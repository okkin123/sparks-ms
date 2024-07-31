const dbConnection = require("../config/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
  register: (req, res) => {
    dbConnection.query(
      "SELECT code_id from tbl_registration_codes WHERE code=? AND status='available'",
      [req.body.code],
      function (err, data1, fields) {
        if (err) console.log(err);
        else if (data1.length == 0)
          res.send({
            status: "ERROR",
            message: "Invalid Registration Code!",
          });
        else
          bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(req.body.password, salt, function (err, hash) {
              dbConnection.query(
                "INSERT INTO tbl_users(firstname, lastname, email_address, password, code_id) VALUES(?,?,?,?,?)",
                [
                  req.body.firstname,
                  req.body.lastname,
                  req.body.email_address,
                  hash,
                  data1[0].code_id,
                ],
                function (err, data2, fields) {
                  if (err) {
                    res.send({
                      status: "ERROR",
                      message: err.sqlMessage,
                    });
                  } else {
                    dbConnection.query(
                      "UPDATE tbl_registration_codes SET status='not available' WHERE code_id=?",
                      [data1[0].code_id],
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
  login: (req, res) => {
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
                      user_id: data[0].user_id,
                      user_email: data[0].email_address,
                    },
                    process.env.SECRET_KEY,
                    {
                      expiresIn: "1h",
                    }
                  );
                  return res.header("Authorization", `Bearer ${token}`).send({
                    status: "SUCCESS",
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
  info: (req, res) => {
    dbConnection.query(
      "SELECT * from vw_users WHERE user_id=?",
      [req.user.user_id],
      function (err, data, fields) {
        if (data.length > 0) {
          res.send(data);
        }
      }
    );
  },
  get_registration_code: (req, res) => {
    dbConnection.query(
      "SELECT * from tbl_registration_codes",
      function (err, data, fields) {
        if (data.length > 0) {
          res.send(data);
        }
      }
    );
  },
  generate_registration_code: (req, res) => {
    const code = crypto.randomBytes(100).toString('hex');
    res.send({registration_code: code})
  }
};
