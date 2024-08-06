const dbConnection = require('../config/database');

module.exports = {
    list: (req, res) =>{
        dbConnection.query("SELECT * FROM tbl_banks",
            function(err, data, fields){
                if(data.length > 0){
                    res.send(data)
                }
            }
        )
    },
    add: (req, res) =>{
        dbConnection.query("INSERT INTO tbl_banks(name, address, account_number, iban, swift_code, routing_code) VALUES(?,?,?,?,?,?)",
            [req.body.name,
            req.body.address,
            req.body.account_number,
            req.body.iban,
            req.body.swift_code,
            req.body.routing_code
            ], 
            function(err, data, fields)
            {
                if(err)
                {
                    res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    });
                }
                else
                {
                    res.send({
                        status: "SUCCESS",
                        message: "New Bank details has been added!"
                    })
                }
            }
        )
    }
}