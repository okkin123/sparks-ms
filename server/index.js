const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoute = require('./routes/auth');
const protectedRoute = require('./routes/protected_route');
const userRoutes = require('./routes/user_routes')

const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

app.use('/auth', authRoute)
app.use('/protected', protectedRoute)
app.use('/user', userRoutes)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
