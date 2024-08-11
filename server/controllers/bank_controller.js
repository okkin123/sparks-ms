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
        dbConnection.query("INSERT INTO tbl_banks(benificiary, name, address, account_number, iban, swift_code, routing_code) VALUES(?,?,?,?,?,?,?)",
            [
                req.body.fields[0].value,
                req.body.fields[1].value,
                req.body.fields[2].value,
                req.body.fields[3].value,
                req.body.fields[4].value,
                req.body.fields[5].value,
                req.body.fields[6].value
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
    },
    delete: (req, res) =>
    {
        dbConnection.query("DELETE FROM tbl_banks WHERE bank_id=?", [req.body.bank_id],
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
                        message: "The selected bank has been deleted!"
                    });
                }
            }
        )
    },
    edit: (req, res) =>{
        dbConnection.query("UPDATE tbl_banks SET benificiary=?, name=?, address=?, account_number=?, iban=?, swift_code=?, routing_code=? WHERE bank_id=?",
            [
                req.body.fields[0].value,
                req.body.fields[1].value,
                req.body.fields[2].value,
                req.body.fields[3].value,
                req.body.fields[4].value,
                req.body.fields[5].value,
                req.body.fields[6].value,
                req.body.fields[7].value,
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
                        message: "The selected bank details has been updated!"
                    })
                }
            }
        )
    },
}