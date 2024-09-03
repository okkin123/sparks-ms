const dbConnection = require('../config/database');

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
                            console.log(result.storedValue)
                            nextValue = parseInt(result.storedValue) + 1;
                        }
                    }
                
                    invoiceNumber = `${nextValue}/${currentYear}`;
                    
                    res.send({
                        status: "SUCCESS",
                        invoice_number: invoiceNumber
                    })
                    
                }
            }
        )
    },
    ref_quotation_numbers: (req, res) => {
        dbConnection.query("SELECT * FROM vw_quotations WHERE status='APPROVED'",
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
    }
}