const dbConnection = require('../config/database');

module.exports = {
    insert: (req, res)=>{
        const values = req.body.values;
        const details = values.flatMap(detail => [
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
      
        const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?,?,?)').join(',');
      
        dbConnection.query(`INSERT INTO tbl_admin_expenses(date, vendor_name, location, description, vat_applicable, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES ${placeholders}`,
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
                message: "New admin expenses for projects are submitted successfuly!"
              });
                
            }
          }
        )
      },
    update: (req, res)=>{
        const values = req.body.values;
        const details = values.flatMap(detail => [
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
        
        const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?,?,?)').join(',');
        
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
                `INSERT INTO tbl_admin_expenses(date, vendor_name, location, description, vat_applicable, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES ${placeholders}`,
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
                      message: "New admin expenses for projects are updated successfully!"
                    });
                  });
                }
              );
            }
          );
        });
      },
    delete: (req, res)=>{
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
                  message: "The selected admin expenses for projects are deleted successfully!"
                });
              }
            })
        
      },
      list: (req, res)=>{
        dbConnection.query(
            "SELECT * FROM vw_admin_expenses ORDER BY date DESC",
            function(err, data, fields) {
              if (err) {
                res.send({
                  status: "ERROR",
                  message: err.sqlMessage
                });
              } else {
                res.send({
                  status: "SUCCESS",
                  admin_expenses: data
                });
              }
            }
          )
          
      },
}