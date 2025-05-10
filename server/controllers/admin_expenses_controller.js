const dbConnection = require('../config/database');

module.exports = {
  get_vendor_details: (req, res)=>{

      dbConnection.query(
          "SELECT * FROM vw_admin_expenses GROUP BY ??",
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
  insert: (req, res)=>{
    const values = req.body.values.expenses;
    const details = values.flatMap(detail => [
    detail.date,
    detail.description,
    detail.is_vat,
    detail.vat_percentage,
    detail.amount_without_vat,
    detail.vat_amount,
    detail.amount_with_vat,
    req.body.values.currency,
    req.user.user_id
    ]);
  
    const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?)').join(',');
  
    dbConnection.query(`INSERT INTO tbl_admin_expenses(date, description, vat_applicable, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES ${placeholders}`,
      details,
      function(err, data, fields){
        if (err) {
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
          console.log(err)
        } else {
          res.send({
            status: "SUCCESS",
            message: "New vendor expenses for projects are submitted successfuly!"
          });
            
        }
      }
    )
  },
  list: (req, res)=>{

    dbConnection.query(
        "SELECT date, status, SUM(amount_without_vat) as amount_without_vat, SUM(vat_amount) as vat_amount, SUM(amount_with_vat) as amount_with_vat, currency, vat_percentage, created_by_email, reporting_to, reporting_to_email FROM vw_admin_expenses GROUP BY date, currency, status, created_by_email ORDER BY date DESC",
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
                  "SELECT * FROM vw_admin_expenses WHERE date=? AND currency=? AND status=? AND created_by_email=?",
                  [item.date, item.currency, item.status, item.created_by_email],
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
                          user_email: req.user.user_email,
                          user_id: req.user.user_id,
                          reporting_to: req.user.reporting_to,
                          admin_expenses: data
                        });
                      }
                    }
                  }
                );
              });
  
            }else{
                res.send({
                  status: "SUCCESS",
                  vendor_expenses: []
                });
            }
  
          }
        }
      )
      
  },
  return_admin_expense: (req, res)=>{
    const values = req.body.values;
  
    const id_details = values.flatMap(id_detail => [id_detail.admin_expense_id]);
    const id_placeholders = values.map(() => '?').join(',');
    dbConnection.query(`UPDATE tbl_admin_expenses SET is_returned=1, is_verified=0, returned_or_verified_by=? WHERE admin_expense_id IN (${id_placeholders})`,
    [req.user.user_id, ...id_details], 
      function(err, data, fields){
        if(err){
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
        }else{
          res.send({
            status: "SUCCESS",
             message: "The selected admin expenses are returned successfully!"
          });
        }
      }
    )
  },

  verify_admin_expense: (req, res)=>{
    const values = req.body.values;
  
    const id_details = values.flatMap(id_detail => [id_detail.admin_expense_id]);
    const id_placeholders = values.map(() => '?').join(',');
  
    dbConnection.query(`UPDATE tbl_admin_expenses SET is_returned=0, is_verified=1, returned_or_verified_by=? WHERE admin_expense_id IN (${id_placeholders})`,
      [req.user.user_id, ...id_details], 
      function(err, data, fields){
        if(err){
          res.send({
            status: "ERROR",
            message: err.sqlMessage
          });
        }else{
          res.send({
            status: "SUCCESS",
            message: "The selected admin expenses are verified successfully!"
          });
        }
      }
    )
  },
  update_admin_expense: (req, res)=>{
    const values = req.body.values.expenses;
    const details = values.flatMap(detail => [
      detail.date,
      detail.description,
      detail.is_vat,
      detail.vat_percentage,
      detail.amount_without_vat,
      detail.vat_amount,
      detail.amount_with_vat,
      req.body.values.currency,
      req.user.user_id
    ]);
    
    const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?)').join(',');
    
    const id_details = values.flatMap(id_detail => [id_detail.admin_expense_id]);
    const id_placeholders = values.map(() => '?').join(',');
    
    dbConnection.beginTransaction(function(err) {
      if (err) {
        return res.send({
          status: "ERROR",
          message: err.sqlMessage
        });
      }
      dbConnection.query(
        `DELETE FROM tbl_admin_expenses WHERE admin_expense_id IN (${id_placeholders})`, 
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
            `INSERT INTO tbl_admin_expenses(date, description, vat_applicable, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES ${placeholders}`,
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
                  message: "The selected admin expenses are updated successfully!"
                });
              });
            }
          );
        }
      );
    });
  },

  delete_admin_expense: (req, res)=>{
    const values = req.body.values;
  
    const id_details = values.flatMap(id_detail => [id_detail.admin_expense_id]);
    const id_placeholders = values.map(() => '?').join(',');
    
    
      dbConnection.query(
        `DELETE FROM tbl_admin_expenses WHERE admin_expense_id IN (${id_placeholders})`, 
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
              message: "The selected admin expenses are deleted successfully!"
            });
          }
        })
    
  },

}