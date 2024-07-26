const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

const userRoutes = require('./routes/user_routes')
app.use('/user', userRoutes)

app.get("/", (req, res) => {
  res.send('hello');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
