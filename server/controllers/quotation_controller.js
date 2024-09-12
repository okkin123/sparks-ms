const dbConnection = require('../config/database');



module.exports = {
    generateQuotationNumber: (req, res)=>
    {
        let initializedValue = 1;
        const currentYear = new Date().getFullYear();
        const prefix = 'BS';
        let quotationNumber;

        dbConnection.query( `SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(MAX(quotation_number), '/', 1), 'BS', -1) AS storedValue, SUBSTRING_INDEX(MAX(quotation_number), '/', -1) AS storedYear FROM tbl_quotations`, 
            function(err, data, fields){
                if(err){
                    res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    })
                }else{
                    const result = data[0]; // Access the first element of the results array
                    let nextValue;
              
                    if (result.storedValue === null) {
                      nextValue = initializedValue;
                    } else{
                        if(result.storedYear != currentYear)
                        {
                            nextValue = initializedValue;
                        }   
                        else
                        {
                            nextValue = parseInt(result.storedValue) + 1;
                        }
                    }
              
                    quotationNumber = `${prefix}${nextValue}/${currentYear}`;
                  
                    res.send({
                        status: "SUCCESS",
                        quotation_number: quotationNumber
                    })
                   
                }
            }
        )
    },
    insert: (req, res)=>
    {
                    const reporting_to = req.user.reporting_to; 
                    let assigned_to;
                    if(reporting_to !== null){
                        assigned_to = reporting_to;
                    }else{
                        assigned_to = JSON.stringify({ 'user_id': [req.user.user_id] });
                    }
                    dbConnection.query("INSERT INTO tbl_quotations(quotation_number, quotation_date, client_name, attention_to, project_name, project_description, amount_without_vat, is_vat, vat_percentage, currency, company_trn, company_address, created_by, assigned_to, status) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [req.body.quotation_number, req.body.values.date, req.body.values.client_name, req.body.values.attention_to, req.body.values.project_name, req.body.values.project_description, req.body.amount_without_vat, req.body.values.is_vat, req.body.vat_percentage, req.body.currency, process.env.TRN, process.env.COMPANY_ADDRESS, req.user.user_id, assigned_to, "WAITING FOR VERIFICATION"],
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
                                quotation_detail.quantity === '' ? null : quotation_detail.quantity,
                                quotation_detail.unit_cost === '' ? null : quotation_detail.unit_cost,
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
                                            message: err2
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
  
    },
    list: (req, res)=>{
        //WHERE JSON_CONTAINS(assigned_to, '"+req.user.user_id+"', '$.user_id') OR created_by=?
        dbConnection.query("SELECT * FROM vw_quotations ORDER BY quotation_number DESC", 
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
                        user_email: req.user.user_email,
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
        const reporting_to = req.user.reporting_to; 
        let assigned_to;
        if(reporting_to !== null){
            assigned_to = reporting_to;
        }else{
            assigned_to = JSON.stringify({ 'user_id': [req.user.user_id] });
        }
        dbConnection.query("UPDATE tbl_quotations SET quotation_date=?, client_name=?, attention_to=?, project_name=?, project_description=?, amount_without_vat=?, is_vat=?, vat_percentage=?, currency=?, company_trn=?, company_address=?, created_by=?, assigned_to=?, status=? WHERE quotation_number=?",
            [req.body.values.date, req.body.values.client_name, req.body.values.attention_to, req.body.values.project_name, req.body.values.project_description, req.body.amount_without_vat, req.body.values.is_vat, req.body.vat_percentage, req.body.currency, process.env.TRN, process.env.COMPANY_ADDRESS, req.user.user_id, assigned_to, "WAITING FOR APPROVAL", req.body.quotation_number],
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
                    const deleteQuery = "DELETE FROM tbl_quotation_details WHERE quotation_number=?";
                    dbConnection.query(deleteQuery, [req.body.quotation_number], function(err4, data4, fields4){
                        if(err4){
                            return res.send({
                                status: "ERROR",
                                message: err4
                            });
                        }
                        else{

                            const quotation_details = req.body.details;
                            const values = quotation_details.flatMap(quotation_detail => [
                            req.body.quotation_number,
                            quotation_detail.description,
                            quotation_detail.quantity === '' ? null : quotation_detail.quantity,
                            quotation_detail.unit_cost === '' ? null : quotation_detail.unit_cost,
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
                                } 

                                const insertQuery = "INSERT INTO tbl_quotation_approval_history (quotation_number, user_id, comments, status) VALUES (?, ?, ?, ?)";
                                const insertValues = [req.body.quotation_number, req.user.user_id, "", "UPDATED"];
                                
                                    dbConnection.query(insertQuery, insertValues, function(err3, data3, fields3) {
                                        if (err3) {
                                            return res.send({
                                                status: "ERROR",
                                                message: err3
                                            });
                                        }
                                
                                        res.send({
                                            status: "SUCCESS",
                                            message: `Quotation #: ${req.body.quotation_number} has been updated for approval!`
                                        });
                                    });

                            });
                                
                        }
                    })
                    
                    
                }
            
            })
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
        dbConnection.query("UPDATE tbl_quotations SET status=? WHERE quotation_number=?",
            [req.body.status, req.body.quotation_number],
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
                    dbConnection.query("INSERT INTO tbl_quotation_approval_history (quotation_number, user_id, comments, supporting_doc, supporting_doc_name, status) VALUES (?, ?, ?, ?, ?, ?)",
                    [req.body.quotation_number, req.user.user_id, req.body.comments, req.body.file_data, req.body.file_name, req.body.status], function(err2, data2, fields2){
                       console.log(err2)
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