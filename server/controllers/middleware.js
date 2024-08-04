const jwt = require('jsonwebtoken');

module.exports = {
    authentication: (req, res, next) =>
    {

        try {
            //   get the token from the authorization header
            const token = req.headers.authorization.split(" ")[1];

            //check if the token matches the supposed origin
            const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

            // retrieve the user details of the logged in user
            const user = decodedToken;
        
            // pass the user down to the endpoints here
            req.user = user;
        
            // pass down functionality to the endpoint
            next();
          } catch (error) {
            res.send({
              message: "Unathorized request!",
            });
          }
    },  
    verify_code: (req, res, next) =>
    {
        try{
            const token = req.headers.authorization.split(" ")[1];
            const pin_code = req.body.first_pin +
                req.body.second_pin +
                req.body.third_pin +
                req.body.fourth_pin;
            
            const decodedToken = jwt.verify(token, pin_code);
        
            user = decodedToken;
        
            req.user = user;
            
            next();
        }catch(error){
            res.send({
                status: "ERROR",
                message: "Invalid Code!",
              });
        }
    }
}