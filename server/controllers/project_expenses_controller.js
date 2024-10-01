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
            "INSERT INTO tbl_project_expenses(invoice_file_name, date_issued, ref_invoice_number, supplier_name, invoice_number, is_vat, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
            [req.file.filename, values.date_issued, values.ref_invoice_number, values.supplier_name, values.supplier_invoice_number, values.is_vat, values.vat_percentage, values.amount_without_vat, vat_amount, amount_with_vat, values.currency, req.user.user_id],
            function(err, data, fields) {
              if (err) {
                res.send({
                  status: "ERROR",
                  message: err.sqlMessage
                });
              } else {
                if(values.save_bank_details){
                  dbConnection.query("INSERT INTO tbl_suppliers(supplier_name, bank_name, account_number, iban) VALUES(?,?,?,?)",
                    [values.supplier_name, values.bank_name, values.account_number, values.iban],
                    function(err2, data2, fields2){
                    
                    }
                  )
                }

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
          "SELECT * FROM vw_project_expenses",
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
              file_url: `https://reimagined-invention-4rw965xj75ghq599-4000.app.github.dev/supplier_invoices/${data[0].invoice_file_name}`,
              project_expense_details: data
            });
          }
        }
      )
    },
  get_payment_details: (req, res)=>{
      
      dbConnection.query(
          "SELECT * FROM tbl_project_expense_payments WHERE name=? GROUP BY name",
          [req.body.name],
          function(err, data, fields) {
            if (err) {
              res.send({
                status: "ERROR",
                message: err.sqlMessage
              });
            } else {
              res.send({
                status: "SUCCESS",
                payment_details: data
              });
            }
          }
        )
        
  },
  insert_payment: (req, res)=>{
    dbConnection.query("INSERT INTO tbl_project_expense_payments(project_expense_id, mode_of_payment, date_paid, cheque_no, bank_name, account_number, name, amount, user_id, supporting_doc_name) VALUES(?,?,?,?,?,?,?,?,?,?)")
    [req.body.project_expense_id, req.body.mode_of_payment, req.body.date_paid, req.body.cheque_no, req.body.bank_name, req.body.account_number, req.body.name, req.body.amount, req.body.user_id, req.user.user_id, req.bodu.file],
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
    }
  }

}