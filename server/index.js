//https://www.freecodecamp.org/news/how-to-build-a-fullstack-authentication-system-with-react-express-mongodb-heroku-and-netlify/#how-to-login-a-user
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user_routes");
const forgotRoutes = require("./routes/forgot_routes");
const quotationRoutes = require("./routes/quotation_routes");

const port = process.env.PORT;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    exposedHeaders: "Content-Length,X-Kuma-Revision",
  })
);

app.use("/user", userRoutes);
app.use("/forgot", forgotRoutes);
app.use("/quotation", quotationRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
