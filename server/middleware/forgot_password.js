const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
  try {
    //   get the token from the authorization header

    const token = await request.headers.authorization.split(" ")[1];
    const pin_code =
      request.body.first_pin +
      request.body.second_pin +
      request.body.third_pin +
      request.body.fourth_pin;

    //check if the token matches the supposed origin
    const decodedToken = await jwt.verify(token, pin_code);

    // retrieve the user details of the logged in user
    user = await decodedToken;

    // pass the user down to the endpoints here
    request.user = user;

    // pass down functionality to the endpoint
    next();
  } catch (error) {
    console.log("Invalid Pin!");
    // response.send({
    //   error: "Invalid Pin!",
    // });
  }
};
