const dbConnection = require('../config/database');
const { company_address } = require('./preferences_controller');



module.exports = {
    generateQuotationNumber: (req, res)=>
    {
        dbConnection.query("SELECT MAX(quotation_number) as quotation_number FROM tbl_quotations",
            function(err, data, fields)
            {
                if(err)
                {
                    res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    })
                }
                else
                {
                    if(data.length > 0)
                    {
                        if(data[0].quotation_number == null)
                        {
                            res.send({
                                status: "SUCCESS",
                                quotation_number: 1
                            })
                        }
                        else
                        {
                            res.send({
                                status: "SUCCESS",
                                quotation_number: data[0].quotation_number + 1
                            })
                        }
                        
                    }
                }
            }
        )
    },
    insert: (req, res)=>
    {
        dbConnection.query("SELECT user_id FROM vw_users WHERE user_type='Operations Manager' OR user_type='Managing Director'",
            function(err3, data3, fields3)
            {
                if(err3)
                {
                    res.send({
                        status: "ERROR",
                        message: err3.sqlMessage
                    })
                }
                else
                {
                    const assigned_to = JSON.stringify({ 'user_id': data3.map(user_id => user_id.user_id) });
                    dbConnection.query("INSERT INTO tbl_quotations(quotation_number, quotation_date, client_name, attention_to, project_name, project_description, amount_without_vat, vat_percentage, created_by, assigned_to, status) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [req.body.quotation_number, req.body.values.date, req.body.values.client_name, req.body.values.attention_to, req.body.values.project_name, req.body.values.project_description, req.body.amount_without_vat, req.body.vat_percentage, req.user.user_id, assigned_to, "WAITING FOR APPROVAL"],
                        function(err, data, fields)
                        {
                            if(err)
                            {
                                res.send({
                                    status: "ERROR",
                                    message: err
                                })
                            }
                            else
                            {
                                const quotation_details = req.body.details;
                                const values = quotation_details.flatMap(quotation_detail => [
                                req.body.quotation_number,
                                quotation_detail.description,
                                quotation_detail.quantity,
                                quotation_detail.unit_cost,
                                quotation_detail.total_cost
                                ]);
            
                                const placeholders = quotation_details.map(() => '(?,?,?,?,?)').join(',');

                                dbConnection.query(
                                    `INSERT INTO tbl_quotation_details (quotation_number, description, qty, unit_cost, total_cost) VALUES ${placeholders}`,
                                    values,
                                    function(err2, data2, fields2) {
                                      if (err2) {
                                        res.send({
                                            status: "ERROR",
                                            message: err
                                        })
                                      } else {
                                        dbConnection.query("INSERT INTO tbl_quotation_approval_history (quotation_number, user_id, comments, status) VALUES (?, ?, ?, ?)",
                                            [req.body.quotation_number, req.user.user_id, "", "CREATED"], function(err3, data3, fields3){})
                                        res.send({
                                          status: "SUCCESS",
                                          message: "Quotation #: " + req.body.quotation_number + " has been submitted for approval!"
                                        });
                                      }
                                    }
                                  );
                            }
                        }
                    )
                }
            }
        )
    },
    list: (req, res)=>{
        dbConnection.query("SELECT * FROM vw_quotations WHERE JSON_CONTAINS(assigned_to, '"+req.user.user_id+"', '$.user_id') OR created_by=? ORDER BY quotation_number DESC", 
            [req.user.user_id], function(err, data, fields){
                if(err)
                {
                    res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    })
                }
                else
                {
                    res.send({
                        status: "SUCCESS",
                        quotations: data
                    })
                }
        })
    },
    details: (req, res)=>{
        dbConnection.query("SELECT * FROM vw_quotations WHERE quotation_number=?", 
            [req.body.quotation_number], function(err, data, fields){
                if(err)
                {
                    res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    })
                }
                else
                {
                    dbConnection.query("UPDATE tbl_quotations SET locked=true WHERE quotation_number=?",
                        [req.body.quotation_number],function(err, data, res){
                            if(err)
                                console.log(err)
                        })
                    dbConnection.query("SELECT * FROM tbl_quotation_details WHERE quotation_number=?",
                        [req.body.quotation_number], function(err2, data2, fields)
                        {
                            if(err2)
                            {
                                res.send({
                                    status: "ERROR",
                                    message: err2.sqlMessage
                                })
                            }
                            else
                            {
                                res.send({
                                    status: "SUCCESS",
                                    trn:  process.env.TRN,
                                    quotation: data,
                                    details: data2
                                })
                            }
                        }
                    )
                    
                }
        })
    },
    update: (req, res)=>
    {
        dbConnection.query("SELECT user_id FROM vw_users WHERE user_type='Operations Manager' OR user_type='Managing Director'",
            function(err3, data3, fields3)
            {
                if(err3)
                {
                    res.send({
                        status: "ERROR",
                        message: err3.sqlMessage
                    })
                }
                else
                {
                    const assigned_to = JSON.stringify({ 'user_id': data3.map(user_id => user_id.user_id) });
                    dbConnection.query("UPDATE tbl_quotations SET quotation_date=?, client_name=?, attention_to=?, project_name=?, project_description=?, amount_without_vat=?, vat_percentage=?, created_by=?, assigned_to=?, status=? WHERE quotation_number=?",
                        [req.body.values.date, req.body.values.client_name, req.body.values.attention_to, req.body.values.project_name, req.body.values.project_description, req.body.amount_without_vat, req.body.vat_percentage, req.user.user_id, assigned_to, "WAITING FOR APPROVAL", req.body.quotation_number],
                        function(err, data, fields)
                        {
                            if(err)
                            {
                                res.send({
                                    status: "ERROR",
                                    message: err
                                })
                            }
                            else
                            {
                                const quotation_details = req.body.details;
                                const values = quotation_details.flatMap(quotation_detail => [
                                quotation_detail.description,
                                quotation_detail.quantity,
                                quotation_detail.unit_cost,
                                quotation_detail.total_cost,
                                quotation_detail.quotation_detail_id
                                ]);
            
                                const placeholders = quotation_details.map(() => 'description=?, qty=?, unit_cost=?, total_cost=? WHERE quotation_detail_id=?').join(',');

                                dbConnection.query(
                                    `UPDATE tbl_quotation_details SET ${placeholders}`,
                                    [...values, req.body.quotation_number],
                                    function(err2, data2, fields2) {
                                        if (err2) {
                                            res.send({
                                                status: "ERROR",
                                                message: err2
                                            })
                                        } else {
                                        dbConnection.query("INSERT INTO tbl_quotation_approval_history (quotation_number, user_id, comments, status) VALUES (?, ?, ?, ?)",
                                            [req.body.quotation_number, req.user.user_id, "", "UPDATED"], function(err3, data3, fields3){})
                                        res.send({
                                            status: "SUCCESS",
                                            message: "Quotation #: " + req.body.quotation_number + " has been updated for approval!"
                                        });
                                        }
                                    }
                                    );
                            }
                        }
                    )
                }
            }
        )
    },
    get_approval_history: (req, res) =>{
        dbConnection.query("SELECT * FROM vw_quotation_approval_history WHERE quotation_number=? ORDER BY date_time ASC", 
            [req.body.quotation_number], function(err, data, fields){
                if(err)
                    {
                        res.send({
                            status: "ERROR",
                            message: err.sqlMessage
                        })
                    }
                    else
                    {
                        res.send({
                            status: "SUCCESS",
                            approval_history: data
                        })
                    }
            }
        )
    },
    update_quotation_status: (req, res)=>{
        dbConnection.query("UPDATE tbl_quotations SET status=?, assigned_to=? WHERE quotation_number=?",
            [req.body.status, JSON.stringify({ 'user_id': req.body.user_id }), req.body.quotation_number],
            function(err, data, fields)
            {
                if(err)
                {
                    res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    })
                }
                else
                {
                    dbConnection.query("INSERT INTO tbl_quotation_approval_history (quotation_number, user_id, comments, status) VALUES (?, ?, ?, ?)",
                    [req.body.quotation_number, req.user.user_id, req.body.comments, req.body.status], function(err2, data2, fields2){
                       
                    })
                    res.send({
                        status: "SUCCESS",
                        message: "Quotation #: " + req.body.quotation_number + " has been "+req.body.status.toLowerCase()+" !"
                    });
                }
            }
        )
    },
    unlock: (req, res)=>{
     
        dbConnection.query("UPDATE tbl_quotations SET locked=false WHERE quotation_number=?",
            [req.body.quotation_number],function(err, data, fields){
                if(err)
                    res.send(err)
                else
                    res.send(data)
            })
    }
    
}