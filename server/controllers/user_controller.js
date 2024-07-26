const dbConnection = require('../config/database');

module.exports = {
    registerUser: (req, res)=>
    {
        dbConnection.query("SELECT token_id from tbl_user_tokens WHERE token=? AND status='available'",
            [req.body.token], function(err, data1, fields)
            {
                if(err)
                    console.log(err);
                else
                    if(data1.length == 0)
                        res.send({
                            status: "ERROR",
                            message: "Invalid Token!"
                        })
                    else
                        dbConnection.query("INSERT INTO tbl_users(firstname, lastname, email_address, password, user_token_id) VALUES(?,?,?,?,?)",
                            [req.body.firstname, req.body.lastname, req.body.email_address, req.body.password, data1[0].token_id],
                            function (err, data2, fields) {
                                if (err) {
                                  res.send({
                                    status: "ERROR",
                                    message: err.sqlMessage
                                  })
                                } else {
                                   dbConnection.query("UPDATE tbl_user_tokens SET status='not available' WHERE token_id=?",
                                    [data1[0].token_id], function(err,data3,fields){});
                                    res.status(201).json({
                                        status: "SUCCESS",
                                        message: "You are registered sucessfully!"
                                       })
                                }
                              }
                        )
                    
            }
        )
    }
}