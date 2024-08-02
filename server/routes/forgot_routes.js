const express = require("express");
const router = express.Router();

const controller = require("../controllers/forgot_password_controller");
const middleware = require("../middleware/forgot_password");

router.route("/send_code").post(controller.send_code);
router.route("/verify_code").post(middleware, controller.verify_code);
module.exports = router;
