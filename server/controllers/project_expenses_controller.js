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
      
      if (values.is_vat) {
          vat_amount = values.vat_amount;
          amount_with_vat = values.amount_with_vat;
      } else {
          vat_amount = 0;
          amount_with_vat = values.amount_without_vat;
      }
      
      const insertExpense = (callback) => {
          dbConnection.query(
              "INSERT INTO tbl_project_expenses(invoice_file_name, invoice_file_path, date_issued, ref_invoice_number, supplier_name, invoice_number, is_vat, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
              [req.file.filename, req.file.path, values.date_issued, values.ref_invoice_number, values.supplier_name, values.supplier_invoice_number, values.is_vat, values.vat_percentage, values.amount_without_vat, vat_amount, amount_with_vat, values.currency, req.user.user_id],
              callback
          );
      };
      
      const checkSupplier = (callback) => {
          dbConnection.query(
              "SELECT * FROM tbl_suppliers WHERE supplier_name=?",
              [values.supplier_name],
              callback
          );
      };
      
      const insertSupplier = () => {
          dbConnection.query(
              "INSERT INTO tbl_suppliers(supplier_name, bank_name, account_name, account_number, iban) VALUES(?,?,?,?,?)",
              [values.supplier_name, values.bank_name, values.account_name, values.account_number, values.iban],
              (err2, data2, fields2) => {
                  if (err2) console.log(err2);
              }
          );
      };
      
      const updateSupplier = (supplier_id) => {
          dbConnection.query(
              "UPDATE tbl_suppliers SET bank_name=?, account_name=?, account_number=?, iban=? WHERE supplier_id=?",
              [values.bank_name, values.account_name, values.account_number, values.iban, supplier_id],
              (err4, data4, fields4) => {
                  if (err4) console.log(err4);
              }
          );
      };
      
      insertExpense((err, data, fields) => {
          if (err) {
              res.send({
                  status: "ERROR",
                  message: err.sqlMessage
              });
          } else {
              checkSupplier((err3, data3, fields3) => {
                  if (data3.length === 0) {
                      insertSupplier();
                  } else {
                      updateSupplier(data3[0].supplier_id);
                  }
              });
              res.send({
                  status: "SUCCESS",
                  message: "New project expense has been added!"
              });
          }
      });
      
          
    },
    list: (req, res)=>{
      dbConnection.query(
          "SELECT * FROM vw_project_expenses ORDER BY pe_number, STATUS DESC",
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
              //file_url: `https://reimagined-invention-4rw965xj75ghq599-4000.app.github.dev/supplier_invoices/${data[0].invoice_file_path}`,
              file_url: `https://4000-okkin123-sparksms-em0guxdrsgp.ws-us116.gitpod.io/${data[0].invoice_file_path}`,
              user_id: req.user.user_id,
              project_expense_details: data
            });
          }
        }
      )
    },
  insert_payment: (req, res)=>{
    const values = JSON.parse(req.body.values);

    const details = values.project_expense_ids.flatMap(project_expense_id => [
      project_expense_id,
      values.mode_of_payment,
      values.date,
      isNaN(parseInt(values.cheque_no)) ? 0 : values.cheque_no,
      values.reference_number,
      req.user.user_id,
      req.file.filename,
      req.file.path
      ]);
    
    const placeholders = values.project_expense_ids.map(() => '(?,?,?,?,?,?,?,?)').join(',');

    dbConnection.query(`INSERT INTO tbl_project_expense_payments(project_expense_id, mode_of_payment, date, cheque_no, reference_no, user_id, supporting_doc_name, supporting_doc_path) VALUES ${placeholders}`,
    details,
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
              vendor_details: data
            });
          }
        }
      )
      
},
insert_vendor_expense: (req, res)=>{
  const values = req.body.values;
  const details = values.flatMap(detail => [
  detail.ref_invoice_number,
  detail.date,
  detail.vendor_name,
  detail.location,
  detail.description,
  detail.is_vat,
  detail.vat_percentage,
  detail.amount_without_vat,
  detail.vat_amount,
  detail.amount_with_vat,
  req.body.currency,
  req.user.user_id
  ]);

  const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?)').join(',');

  dbConnection.query(`INSERT INTO tbl_project_vendor_expenses(ref_invoice_number, date, vendor_name, location, description, vat_applicable, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES ${placeholders}`,
    details,
    function(err, data, fields){
      if (err) {
        res.send({
          status: "ERROR",
          message: err.sqlMessage
        });
      } else {
        res.send({
          status: "SUCCESS",
          message: "New vendor expenses for projects are submitted successfuly!"
        });
          
      }
    }
  )
},
update_vendor_expense: (req, res)=>{
  const values = req.body.values;
  const details = values.flatMap(detail => [
    detail.ref_invoice_number,
    detail.date,
    detail.vendor_name,
    detail.location,
    detail.description,
    detail.is_vat,
    detail.vat_percentage,
    detail.amount_without_vat,
    detail.vat_amount,
    detail.amount_with_vat,
    req.body.currency,
    req.user.user_id
  ]);
  
  const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
  
  const id_details = values.flatMap(id_detail => [id_detail.project_vendor_expense_id]);
  const id_placeholders = values.map(() => '?').join(',');
  
  dbConnection.beginTransaction(function(err) {
    if (err) {
      return res.send({
        status: "ERROR",
        message: err.sqlMessage
      });
    }
  
    dbConnection.query(
      `DELETE FROM tbl_project_vendor_expenses WHERE project_vendor_expense_id IN (${id_placeholders})`, 
      id_details,
      function(err1, data1, fields1) {
        if (err1) {
          return dbConnection.rollback(function() {
            res.send({
              status: "ERROR",
              message: err1.sqlMessage
            });
          });
        }
  
        dbConnection.query(
          `INSERT INTO tbl_project_vendor_expenses(ref_invoice_number, date, vendor_name, location, description, vat_applicable, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES ${placeholders}`,
          details,
          function(err2, data2, fields2) {
            if (err2) {
              return dbConnection.rollback(function() {
                res.send({
                  status: "ERROR",
                  message: err2.sqlMessage
                });
              });
            }
  
            dbConnection.commit(function(err3) {
              if (err3) {
                return dbConnection.rollback(function() {
                  res.send({
                    status: "ERROR",
                    message: err3.sqlMessage
                  });
                });
              }
  
              res.send({
                status: "SUCCESS",
                message: "New vendor expenses for projects are updated successfully!"
              });
            });
          }
        );
      }
    );
  });
},
delete_vendor_expense: (req, res)=>{
  const values = req.body.values;

  const id_details = values.flatMap(id_detail => [id_detail.project_vendor_expense_id]);
  const id_placeholders = values.map(() => '?').join(',');
  
  
    dbConnection.query(
      `DELETE FROM tbl_project_vendor_expenses WHERE project_vendor_expense_id IN (${id_placeholders})`, 
      id_details,
      function(err, data, fields) {
        if (err) {
            res.send({
              status: "ERROR",
              message: err.sqlMessage
            });
        }else{
          res.send({
            status: "SUCCESS",
            message: "The selected vendor expenses for projects are deleted successfully!"
          });
        }
      })
  
},
list_vendor_expense: (req, res)=>{
  dbConnection.query(
      "SELECT * FROM vw_project_vendor_expenses ORDER BY date DESC",
      function(err, data, fields) {
        if (err) {
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
        } else {
          res.send({
            status: "SUCCESS",
            vendor_expenses: data
          });
        }
      }
    )
    
},

}