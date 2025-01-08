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
    detail.vendor_name,
    detail.description,
    detail.is_vat,
    detail.vat_percentage,
    detail.amount_without_vat,
    detail.vat_amount,
    detail.amount_with_vat,
    req.body.values.currency,
    req.user.user_id
    ]);
  
    const placeholders = values.map(() => '(?,?,?,?,?,?,?,?,?,?)').join(',');
  
    dbConnection.query(`INSERT INTO tbl_admin_expenses(date, vendor_name, description, vat_applicable, vat_percentage, amount_without_vat, vat_amount, amount_with_vat, currency, user_id) VALUES ${placeholders}`,
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
        "SELECT invoice_number, status, project_name, SUM(amount_without_vat) as amount_without_vat, SUM(vat_amount) as vat_amount, SUM(amount_with_vat) as amount_with_vat, currency, vat_percentage, created_by_email, reporting_to, reporting_to_email FROM vw_project_vendor_expenses GROUP BY invoice_number, currency, status, created_by_email ORDER BY invoice_number DESC",
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
                  "SELECT * FROM vw_project_vendor_expenses WHERE invoice_number=? AND currency=? AND status=? AND created_by_email=?",
                  [item.invoice_number, item.currency, item.status, item.created_by_email],
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
                  vendor_expenses: []
                });
            }
  
          }
        }
      )
      
  },
}