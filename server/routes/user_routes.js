const express = require("express")  
const router = express.Router()

const controller = require("../controllers/user_controller")

router.route("/findEmail").post(controller.findEmail);
router.route("/register").post(controller.registerUser);

module.exports = router;