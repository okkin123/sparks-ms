const dbConnection = require('../config/database');

function formatNumber(num) {
    return num < 10 ? num.toString().padStart(2, '0') : num
}


module.exports = {
    generateInvoiceNumber: (req, res)=>
    {
        let initializedValue = 1;
        const currentYear = new Date().getFullYear();
        let invoiceNumber;

        dbConnection.query( `SELECT SUBSTRING_INDEX(MAX(invoice_number), '/', 1) AS storedValue, SUBSTRING_INDEX(MAX(invoice_number), '/', -1) AS storedYear FROM tbl_invoices`, 
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
                
                    invoiceNumber = `${formatNumber(nextValue)}/${currentYear}`;
                    
                    res.send({
                        status: "SUCCESS",
                        invoice_number: invoiceNumber
                    })
                    
                }
            }
        )
    },
    ref_quotation_numbers: (req, res) => {
        dbConnection.query("SELECT * FROM vw_quotations WHERE status='APPROVED BY CLIENT' AND remaining_quotation_balance!=0",
            function(err, data, fields){
                if(err){
                    res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    })
                }else{
                    res.send({
                        status: "SUCCESS",
                        quotations: data
                    })
                }
            
            }
        )
    },
    selected_ref_quotation: (req, res)=>{
        dbConnection.query("SELECT * FROM vw_quotations WHERE quotation_number=?", 
            [req.body.quotation_number], function(err, data, fields){
                if(err){
                    res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    })
                }else{
                    res.send({
                        status: "SUCCESS",
                        quotation: data
                    })
                }

            }
        )
    },
    insert: (req, res)=>{
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
                    dbConnection.query("INSERT INTO tbl_invoices(invoice_number, quotation_number, invoice_date, address, client_trn, amount_without_vat, created_by, assigned_to, status) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [req.body.invoice_number, req.body.values.ref_quotation_number, req.body.values.date, req.body.values.address, req.body.values.client_trn, req.body.amount_without_vat, req.user.user_id, assigned_to, "WAITING FOR VERIFICATION"],
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
                                const invoice_details = req.body.details;
                                const values = invoice_details.flatMap(invoice_detail => [
                                req.body.invoice_number,
                                invoice_detail.topics,
                                invoice_detail.amount_without_vat
                                ]);
            
                                const placeholders = invoice_details.map(() => '(?,?,?)').join(',');

                                dbConnection.query(
                                    `INSERT INTO tbl_invoice_details(invoice_number, topics, amount_without_vat) VALUES ${placeholders}`,
                                    values,
                                    function(err2, data2, fields2) {
                                      if (err2) {
                                        res.send({
                                            status: "ERROR",
                                            message: err2
                                        })
                                      } else {
                                        dbConnection.query("INSERT INTO tbl_invoice_approval_history (invoice_number, user_id, comments, status) VALUES (?, ?, ?, ?)",
                                            [req.body.invoice_number, req.user.user_id, "", "CREATED"], function(err3, data3, fields3){})
                                        res.send({
                                          status: "SUCCESS",
                                          message: "Invoice #: " + req.body.invoice_number + " has been submitted for approval!"
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
        //WHERE JSON_CONTAINS(assigned_to, '"+req.user.user_id+"', '$.user_id') OR created_by=?
        dbConnection.query("SELECT * FROM vw_invoices ORDER BY invoice_number DESC", function(err, data, fields){
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
                        invoices: data
                    })
                }
        })
    },
    details: (req, res)=>{
        dbConnection.query("SELECT * FROM vw_invoices WHERE invoice_number=?", 
            [req.body.invoice_number], function(err, data, fields){
                if(err)
                {
                    res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    })
                }
                else
                {
                    // dbConnection.query("UPDATE tbl_quotations SET locked=true WHERE quotation_number=?",
                    //     [req.body.quotation_number],function(err, data, res){
                    //         if(err)
                    //             console.log(err)
                    //     })
                    dbConnection.query("SELECT * FROM tbl_invoice_details WHERE invoice_number=?",
                        [req.body.invoice_number], function(err2, data2, fields)
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
                                    invoice: data,
                                    details: data2
                                })
                            }
                        }
                    )
                    
                }
        })
    },
    get_approval_history: (req, res) =>{
        dbConnection.query("SELECT * FROM vw_invoice_approval_history WHERE invoice_number=? ORDER BY date_time ASC", 
            [req.body.invoice_number], function(err, data, fields){
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
    update_invoice_status: (req, res)=>{
        let filePath, fileName;
        const values = JSON.parse(req.body.values);
        if(values.file === null)
        {
            filePath = values.file;
            fileName = values.file;
        }
        else
        {
            filePath = req.file.path;
            fileName = req.file.filename
        }
        dbConnection.query("UPDATE tbl_invoices SET status=? WHERE invoice_number=?",
            [values.status, values.invoice_number],
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
                    dbConnection.query("INSERT INTO tbl_invoice_approval_history (invoice_number, user_id, comments, supporting_doc_path, supporting_doc_name, status) VALUES (?, ?, ?, ?, ?, ?)",
                    [values.invoice_number, req.user.user_id, values.comments, filePath, fileName, values.status], function(err2, data2, fields2){
                       console.log(err2)
                    })
                    res.send({
                        status: "SUCCESS",
                        message: "Quotation #: " + values.invoice_number + " has been "+ values.status.toLowerCase() +" !"
                    });
                }
            }
        )
    },
}