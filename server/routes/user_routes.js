const express = require("express")  
const router = express.Router()

const controller = require("../controllers/user_controller")

router.route("/register").post(controller.registerUser);

module.exports = router;