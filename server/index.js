//https://www.freecodecamp.org/news/how-to-build-a-fullstack-authentication-system-with-react-express-mongodb-heroku-and-netlify/#how-to-login-a-user
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

//const authMiddleware = require("./controllers/auth_middleware");
const userRoutes = require("./routes/user_routes");

const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/user", userRoutes);

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, PATCH, OPTIONS"
//   );
//   next();
// });

// authentication endpoint
// app.get("/auth-endpoint", authMiddleware, (request, response) => {
//   //console.log(request.user);
//   response.send(request.user);
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
