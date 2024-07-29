//https://www.freecodecamp.org/news/how-to-build-a-fullstack-authentication-system-with-react-express-mongodb-heroku-and-netlify/#how-to-login-a-user
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

const authMiddleware = require("./controllers/auth_middleware");
const userRoutes = require("./routes/user_routes");

const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/user", userRoutes);

// authentication endpoint
app.get("/auth-endpoint", authMiddleware, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
