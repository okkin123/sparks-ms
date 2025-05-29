const dbConnection = require('../config/database');

function formatNumber(num) {
    //return num < 10 ? num.toString().padStart(3, '0') : num
    return num.toString().padStart(3, '0')
}
function incrementSuffix(value) {
    return value.replace(/([A-Z]+\d+)-?([A-Z]*)(\/\d{4})$/, (match, prefix, suffix, year) => {
        if (!suffix) return `${prefix}-A${year}`; // Start with "A" if no suffix exists

        let suffixArr = suffix.split("").reverse();
        let carry = true;

        for (let i = 0; i < suffixArr.length && carry; i++) {
            if (suffixArr[i] !== "Z") {
                suffixArr[i] = String.fromCharCode(suffixArr[i].charCodeAt(0) + 1);
                carry = false;
            } else {
                suffixArr[i] = "A";
            }
        }

        if (carry) suffixArr.push("A"); // Handle "Z" rolling to "AA"

        return `${prefix}-${suffixArr.reverse().join("")}${year}`;
    });
}

module.exports = {
    generateQuotationNumber: (req, res) => {
        let initializedValue = 1;
        const currentYear = new Date().getFullYear();
        const prefix = 'BS';
        let quotationNumber;
        const is_series = req.body.is_series;
        let series_quotation_numbers = [];

        dbConnection.query(
            `SELECT RIGHT(MAX(quotation_order_number), 3) AS storedValue, 
                    LEFT(MAX(quotation_order_number), 4) AS storedYear 
            FROM vw_quotations`, 
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    });
                }

                const result = data[0]; 
                let nextValue;

                if (result.storedValue === null || result.storedYear != currentYear) {
                    nextValue = initializedValue;
                } else {
                    nextValue = parseInt(result.storedValue) + 1;
                }

                if (is_series) {
                    quotationNumber = incrementSuffix(`${prefix}${formatNumber(nextValue)}/${currentYear}`);
                    series_quotation_numbers.push(quotationNumber);

                    dbConnection.query(`SELECT quotation_number FROM vw_quotations WHERE is_series=?`, [is_series], 
                        function(err1, data1) {
                            if (err1) {
                                return res.send({
                                    status: "ERROR",
                                    message: err1.sqlMessage
                                });
                            }

                            data1.forEach(element => {
                                series_quotation_numbers.push(incrementSuffix(element.quotation_number));
                            });

                            // Respond once the array is fully populated
                            res.send({
                                status: "SUCCESS",
                                quotation_number: quotationNumber,
                                series_quotation_numbers: series_quotation_numbers
                            });
                        }
                    );
                } else {
                    quotationNumber = `${prefix}${formatNumber(nextValue)}/${currentYear}`;

                    // Immediate response for non-series quotations
                    res.send({
                        status: "SUCCESS",
                        quotation_number: quotationNumber,
                        series_quotation_numbers: []
                    });
                }
            }
        );
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
                    dbConnection.query("INSERT INTO tbl_quotations(is_series, quotation_number, quotation_date, client_name, attention_to, project_name, project_description, amount_without_vat, discount, is_vat, vat_percentage, currency, company_trn, company_address, created_by, assigned_to, status, notes) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [req.body.values.is_series, req.body.quotation_number, req.body.values.date, req.body.values.client_name, req.body.values.attention_to, req.body.values.project_name, req.body.values.project_description, req.body.amount_without_vat, req.body.values.discount, req.body.values.is_vat, req.body.values.vat_percentage, req.body.values.currency, process.env.TRN, process.env.COMPANY_ADDRESS, req.user.user_id, assigned_to, "WAITING FOR VERIFICATION", req.body.values.notes],
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
                                            [req.body.quotation_number, req.user.user_id, "", "CREATED"], function(err3, data3, fields3){
                                                console.log(err3)
                                            })
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
        dbConnection.query("SELECT * FROM vw_quotations ORDER BY quotation_order_number DESC", function(err, data, fields){
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
                    // dbConnection.query("UPDATE tbl_quotations SET locked=true WHERE quotation_number=?",
                    //     [req.body.quotation_number],function(err, data, res){
                    //         if(err)
                    //             console.log(err)
                    //     })
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
        dbConnection.query("UPDATE tbl_quotations SET quotation_date=?, client_name=?, attention_to=?, project_name=?, project_description=?, amount_without_vat=?, discount=?, is_vat=?, vat_percentage=?, currency=?, company_trn=?, company_address=?, created_by=?, assigned_to=?, status=?, notes=? WHERE quotation_number=?",
            [req.body.values.date, req.body.values.client_name, req.body.values.attention_to, req.body.values.project_name, req.body.values.project_description, req.body.amount_without_vat, req.body.values.discount, req.body.values.is_vat, req.body.values.vat_percentage, req.body.values.currency, process.env.TRN, process.env.COMPANY_ADDRESS, req.user.user_id, assigned_to, "WAITING FOR VERIFICATION", req.body.values.notes, req.body.quotation_number],
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
        dbConnection.query("UPDATE tbl_quotations SET status=? WHERE quotation_number=?",
            [values.status, values.quotation_number],
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
                    dbConnection.query("INSERT INTO tbl_quotation_approval_history (quotation_number, user_id, comments, supporting_doc_path, supporting_doc_name, status) VALUES (?, ?, ?, ?, ?, ?)",
                    [values.quotation_number, req.user.user_id, values.comments, filePath, fileName, values.status], function(err2, data2, fields2){
                       console.log(err2)
                    })
                    res.send({
                        status: "SUCCESS",
                        message: "Quotation #: " + values.quotation_number + " has been "+ values.status.toLowerCase() +" !"
                    });
                }
            }
        )
    },
    download_supporting_doc: (req, res)=>{
        const filename = req.params.filename;
        const filePath = `uploads/${filename}`;
        res.download(filePath, (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('File not found.');
          }
        });
    },
    unlock: (req, res)=>{
     
        dbConnection.query("UPDATE tbl_quotations SET locked=false WHERE quotation_number=?",
            [req.body.quotation_number],function(err, data, fields){
                if(err)
                    res.send(err)
                else
                    res.send(data)
            })
    },
    invoices_issued: (req, res)=>{
        dbConnection.query("SELECT * FROM vw_invoices WHERE quotation_number=? AND (status<>'VOIDED' AND status<>'NO RESPONSE FROM CLIENT' AND status<>'REJECTED BY CLIENT')",
            [req.body.quotation_number], function(err, data, fields){
                if(err)
                    res.send({
                        status: "ERROR",
                        message: err.sqlMessage
                    });
                else
                    res.send({
                        status: "SUCCESS",
                        invoices: data
                    });
            }
        )
    },
    get_quotation_client_details: (req, res)=>{
        dbConnection.query(
            "SELECT * FROM vw_quotations WHERE status <> 'VOIDED' AND status <> 'NO RESPONSE FROM CLIENT' AND status <> 'REJECTED BY CLIENT' GROUP BY ??", 
            [req.body.field_name], 
            function(err, data, fields) {
              if (err) {
                res.send({
                  status: "ERROR",
                  message: err.sqlMessage
                });
              } else {
                res.send({
                  status: "SUCCESS",
                  client_details: data
                });
              }
            }
          )
          
    }
    
}