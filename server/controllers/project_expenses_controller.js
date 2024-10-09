const dbConnection = require('../config/database');
const path = require('path');

module.exports = {
    get_supplier_details: (req, res)=>{
        dbConnection.query(
            "SELECT * FROM tbl_suppliers",
            function(err, data, fields) {
              if (err) {
                res.send({
                  status: "ERROR",
                  message: err.sqlMessage
                });
              } else {
                res.send({
                  status: "SUCCESS",
                  suppliers: data
                });
              }
            }
          )
          
    },
    get_invoice_details: (req, res)=>{
        dbConnection.query(
            "SELECT * FROM vw_invoices WHERE status='VERIFIED' OR status='PAYMENT RECEIVED FROM CLIENT'",
            function(err, data, fields) {
              if (err) {
                res.send({
                  status: "ERROR",
                  message: err.sqlMessage
                });
              } else {
                res.send({
                  status: "SUCCESS",
                  invoice_details: data
                });
              }
            }
          )
          
    },
    insert: (req, res)=>{
        let vat_amount, amount_with_vat;
        const values = JSON.parse(req.body.values);
        if(values.is_vat){
            vat_amount = values.vat_amount;
            amount_with_vat = values.amount_with_vat
        }else{
            vat_amount = 0;
            amount_with_vat = values.amount_without_vat
        }

    

        dbConnection.query(
            "INSERT INTO tbl_project_expenses(invoice_file_name, invoice_file_path, date_issued, ref_invoice_number, supplier_name, invoice_number, is_vat, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [req.file.filename, req.file.path, values.date_issued, values.ref_invoice_number, values.supplier_name, values.supplier_invoice_number, values.is_vat, values.vat_percentage, values.amount_without_vat, vat_amount, amount_with_vat, values.currency, req.user.user_id],
            function(err, data, fields) {
              if (err) {
                res.send({
                  status: "ERROR",
                  message: err.sqlMessage
                });
              } else {
                  dbConnection.query("SELECT * FROM tbl_suppliers WHERE supplier_name=?",
                    [values.supplier_name],
                    function(err3, data3, fields3){
          
                      if(data3.length === 0){
                        dbConnection.query("INSERT INTO tbl_suppliers(supplier_name, bank_name, account_name, account_number, iban) VALUES(?,?,?,?,?)",
                          [values.supplier_name, values.bank_name, values.account_name, values.account_number, values.iban],
                          function(err2, data2, fields2){})
                      }else{
                        
                        dbConnection.query("UPDATE tbl_suppliers SET bank_name=?, account_name=?, account_number=?, iban=? WHERE supplier_id=?",
                          [values.bank_name, values.account_name, values.account_number, values.iban, data3[0].supplier_id],
                          function(err4, data4, fields4){
                            if(err4)
                              console.log(err4)
                          })
                      }
                        
                    }
                  )
                res.send({
                  status: "SUCCESS",
                  message: "New project expense has been added!"
                });
              }
            }
          )
          
    },
    list: (req, res)=>{
      dbConnection.query(
          "SELECT * FROM vw_project_expenses ORDER BY pe_number DESC",
          function(err, data, fields) {
            if (err) {
              res.send({
                status: "ERROR",
                message: err.sqlMessage
              });
            } else {
              res.send({
                status: "SUCCESS",
                project_expenses: data
              });
            }
          }
        )
        
  },
  details: (req, res)=>{
    const envFilePath = path.join(__dirname, '..', '');

    dbConnection.query(
        "SELECT * FROM vw_project_expenses WHERE pe_number=?",
        [req.body.pe_number],
        function(err, data, fields) {
          if (err) {
            res.send({
              status: "ERROR",
              message: err.sqlMessage
            });
          } else {
            res.send({
              status: "SUCCESS",
              file_url: `https://reimagined-invention-4rw965xj75ghq599-4000.app.github.dev/supplier_invoices/${data[0].invoice_file_path}`,
              //file_url: `http://localhost:4000/supplier_invoices/${data[0].invoice_file_name}`,
              user_id: req.user.user_id,
              project_expense_details: data
            });
          }
        }
      )
    },
  insert_payment: (req, res)=>{
    const values = JSON.parse(req.body.values);
    dbConnection.query("INSERT INTO tbl_project_expense_payments(project_expense_id, mode_of_payment, date_paid, cheque_no, bank_name, account_name, account_number, iban, amount, user_id, supporting_doc_name, supporting_doc_path) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
    [values.project_expense_id, values.mode_of_payment, values.date, isNaN(parseInt(values.cheque_no)) ? 0 : values.cheque_no, values.bank_name, values.account_name, values.account_number, values.iban, values.amount, req.user.user_id, req.file.filename, req.file.path],
    function(err, data, fields) {
      if (err) {
        res.send({
          status: "ERROR",
          message: err.sqlMessage
        });
      } else {
        res.send({
          status: "SUCCESS",
          message: "New payment has been added!"
        });
      }
    })
  },
  payments: (req, res) =>{
    dbConnection.query("SELECT * FROM vw_project_expense_payments WHERE project_expense_id=? ORDER BY project_expense_id DESC",
      [req.body.project_expense_id],
      function(err, data, fields){
        if (err) {
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
        } else {
          res.send({
            status: "SUCCESS",
            user_id: req.user.user_id,
            payments: data
          });
        }
      }
    )
  },
  download_file: (req, res)=>{
    const filepath = req.body.filepath;
    res.download(filepath, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('File not found.');
      }
    });
  },
  void_payment: (req, res)=>{
    dbConnection.query("UPDATE tbl_project_expense_payments SET voided_by=? WHERE project_expense_payment_id=?",
      [req.user.user_id, req.body.project_expense_payment_id],
      function(err, data, fields){
        if (err) {
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
        } else {
          res.send({
            status: "SUCCESS",
            message: "Thes selected payment has been voided!"
          });
        }
      }
    )
  },
  void_expense: (req, res)=>{
    dbConnection.query("UPDATE tbl_project_expenses SET is_void=? WHERE project_expense_id=? AND user_id=?",
      [true, req.body.project_expense_id, req.user.user_id],
      function(err, data, fields){
        if (err) {
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
        } else {
          res.send({
            status: data.length > 0 ? "SUCCESS" : "WARNING",
            message: data.length > 0 ? "This project expense has been voided!" : "You are not authorized to void this expense!"
          });
            
        }
      }
    )
  },
  get_vendor_details: (req, res)=>{
    dbConnection.query(
        "SELECT * FROM vw_project_vendor_expenses GROUP BY ??",
        [req.body.fieldname],
        function(err, data, fields) {
          if (err) {
            res.send({
              status: "ERROR",
              message: err.sqlMessage
            });
          } else {
            res.send({
              status: "SUCCESS",
              vendor_details: data
            });
          }
        }
      )
      
},

}