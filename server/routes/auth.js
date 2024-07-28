const express = require('express');
const router = express.Router();
const dbConnection = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

 router.post("/login", (req, res) => {
        try {
      
              dbConnection.query("SELECT * from vw_users WHERE email_address=?",
                [req.body.email_address], function(err, data, fields)
                {
                    if(err)
                    {
                        return res.send({
                            status: "ERROR",
                            message: err
                        });
                    }
                    else
                    {
                        if (data.length === 0) 
                        {
                            return res.send({
                                status: "ERROR",
                                message: 'Email Address not Found!'
                            });
                        }
                            
                        bcrypt.compare(req.body.password, data[0].password, function(err, result) {
                            if (err) { 
                                
                                return res.send({
                                    status: "ERROR",
                                    message: err
                                });
                            }

                            if (!result) {
                                    return res.send({
                                        status: "ERROR",
                                        message: 'Invalid Password!'
                                    });
                            }
                            else
                            {
                                const token = jwt.sign({ userId: data[0].user_id }, 'lovekonikz', {
                                expiresIn: '1h',
                                });
                                return res.status(200).json({ 
                                    status: "SUCCESS",
                                    token: token
                                 });
                            }
                        });
                          
                            
                    }
                   

                }
            )
           
    
            } catch (error) {
            res.status(500).json({ error: 'Login failed' });
            }
    });

module.exports = router;


