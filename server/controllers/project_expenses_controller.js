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
              "INSERT INTO tbl_project_supplier_expenses(invoice_file_name, invoice_file_path, date_issued, ref_invoice_number, supplier_name, invoice_number, is_vat, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
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
              "INSERT INTO tbl_suppliers(supplier_name, bank_name, account_name, account_number, iban, mobile_no, email_address, trn_no) VALUES(?,?,?,?,?,?,?,?)",
              [values.supplier_name, values.bank_name, values.account_name, values.account_number, values.iban, values.mobile_no, values.email_address, values.trn_no],
              (err2, data2, fields2) => {
                  if (err2) console.log(err2);
              }
          );
      };
      
      const updateSupplier = (supplier_id) => {
          dbConnection.query(
              "UPDATE tbl_suppliers SET bank_name=?, account_name=?, account_number=?, iban=?, mobile_no=?, email_address=?, trn_no=? WHERE supplier_id=?",
              [values.bank_name, values.account_name, values.account_number, values.iban, values.mobile_no, values.email_address, values.trn_no, supplier_id],
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
          "SELECT * FROM vw_project_supplier_expenses ORDER BY pe_number DESC",
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
        "SELECT * FROM vw_project_supplier_expenses WHERE pe_number=?",
        [req.body.pe_number],
        function(err, data, fields) {
          if (err) {
            res.send({
              status: "ERROR",
              message: err.sqlMessage
            });
          } else {
            dbConnection.query("SELECT * FROM vw_project_supplier_expense_payments WHERE pe_number=? ORDER by date_paid DESC",
              [req.body.pe_number],
              function(err1, data1, fields1){
                if (err1) {
                  res.send({
                    status: "ERROR",
                    message: err1.sqlMessage
                  });
                }else {
                  res.send({
                    status: "SUCCESS",
                    //file_url: `https://reimagined-invention-4rw965xj75ghq599-4000.app.github.dev/supplier_invoices/${data[0].invoice_file_path}`,
                    file_url: `https://4000-okkin123-sparksms-em0guxdrsgp.ws-us116.gitpod.io/${data[0].invoice_file_path}`,
                    user_id: req.user.user_id,
                    project_supplier_expense_details: data,
                    project_supplier_payment_details: data1,
                  });
                }
              }
            )
            

          }
        }
      )
    },
  insert_payment: (req, res)=>{
    const values = JSON.parse(req.body.values);

    const details = values.project_supplier_expense_ids.flatMap(project_supplier_expense_id => [
      project_supplier_expense_id,
      values.mode_of_payment,
      values.date,
      isNaN(parseInt(values.cheque_no)) ? 0 : values.cheque_no,
      values.reference_number,
      req.user.user_id,
      values.file !== null ? req.file.filename : null,
      values.file !== null ? req.file.path : null
      ]);
    
    const placeholders = values.project_supplier_expense_ids.map(() => '(?,?,?,?,?,?,?,?)').join(',');

    dbConnection.query(`INSERT INTO tbl_project_supplier_expense_payments(project_supplier_expense_id, mode_of_payment, date, cheque_no, reference_no, user_id, supporting_doc_name, supporting_doc_path) VALUES ${placeholders}`,
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
  get_supplier_payments: (req, res)=>{
    dbConnection.query(
      "SELECT supplier_name, mode_of_payment, date_paid, cheque_no, reference_no, SUM(amount) as amount, currency, processed_by, voided_by, status, supporting_doc_name, supporting_doc_path, reporting_to FROM vw_project_supplier_expense_payments GROUP BY supplier_name, mode_of_payment, date_paid, cheque_no, reference_no, currency, processed_by",
      function(err, data, fields) {
        if (err) {
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
        } else {
          let completedQueries = 0;
    
          data.forEach((item, index) => {
            dbConnection.query(
              "SELECT pe_number, invoice_number, project_name, mode_of_payment, date_paid, cheque_no, reference_no, amount, currency, processed_by, status FROM vw_project_supplier_expense_payments WHERE supplier_name=? AND mode_of_payment=? AND date_paid=? AND cheque_no=? AND reference_no=? AND currency=? AND processed_by=?",
              [item.supplier_name, item.mode_of_payment, item.date_paid, item.cheque_no, item.reference_no, item.currency, item.processed_by],
              function(err1, data1, fields1) {
                if (err1) {
                  res.send({
                    status: "ERROR",
                    message: err1.sqlMessage
                  });
                  return;
                } else {
                  // Push the details into the corresponding item in the data array
                  data[index].details = data1;
                  completedQueries++;
    
                  if (completedQueries === data.length) {
                    res.send({
                      status: "SUCCESS",
                      user_id: req.user.user_id,
                      supplier_payments: data
                    });
                  }
                }
              }
            );
          });
        }
      }
    );
  },
  void_supplier_payments: (req, res)=>{
    console.log(req.body.supporting_doc_name)
    dbConnection.query("UPDATE tbl_project_supplier_expense_payments SET voided_by=? WHERE supporting_doc_name=?",
      [req.user.user_id, req.body.supporting_doc_name],
      function name(err, data, fields) {
        if (err) {
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
        } else {
          res.send({
            status: "SUCCESS",
            message: "The selected project expense is voided!"
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
  void_expense: (req, res)=>{
    dbConnection.query("UPDATE tbl_project_supplier_expenses SET is_void=? WHERE project_supplier_expense_id=?",
      [true, req.body.project_supplier_expense_id],
      function(err, data, fields){
        if (err) {
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
        } else {
          res.send({
            status: "SUCCESS",
            message: "This project expense has been voided!"
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
  const values = req.body.values.expenses;
  const details = values.flatMap(detail => [
  req.body.values.ref_invoice_number,
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
  const values = req.body.values.expenses;
  const details = values.flatMap(detail => [
    req.body.values.ref_invoice_number,
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
      "SELECT invoice_number, project_name, SUM(amount_with_vat) as amount, currency, created_by_email FROM vw_project_vendor_expenses WHERE created_by_email=? GROUP BY invoice_number, currency ORDER BY date DESC",
      [req.user.user_email],
      function(err, data, fields) {
        if (err) {
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
        } else {
          if(data.length > 0){

            let completedQueries = 0;
    
            data.forEach((item, index) => {
              dbConnection.query(
                "SELECT * FROM vw_project_vendor_expenses WHERE invoice_number=? AND currency=? ORDER BY date DESC",
                [item.invoice_number, item.currency],
                function(err1, data1, fields1) {
                  if (err1) {
                    res.send({
                      status: "ERROR",
                      message: err1.sqlMessage
                    });
                    return;
                  } else {
  
                    data1.forEach((item1, index1)=>{
                      data1[index1].selected = false;
                    })
  
                    data[index].details = data1;
                    completedQueries++;
      
                    if (completedQueries === data.length) {
                      res.send({
                        status: "SUCCESS",
                        //user_id: req.user.user_id,
                        vendor_expenses: data
                      });
                    }
                  }
                }
              );
            });

          }else{
              res.send({
                status: "SUCCESS",
                //user_id: req.user.user_id,
                vendor_expenses: []
              });
          }

        }
      }
    )
    
},
get_supplier_statement: (req, res)=>{
  dbConnection.query("SELECT * FROM vw_project_supplier_statement WHERE supplier_name=? AND (date_issued BETWEEN ? AND ?) ORDER BY date_issued",
    [req.body.supplier_name, req.body.from_date, req.body.to_date],
    function(err, data, fields)
    {
      if (err) {
        res.send({
          status: "ERROR",
          message: err.sqlMessage
        });
      } else {
        res.send({
          status: "SUCCESS",
          supplier_statement: data
        });
      }
    }
  )
}

}