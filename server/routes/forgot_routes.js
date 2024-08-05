const express = require("express");
const router = express.Router();

const controller = require("../controllers/forgot_password_controller");
const middleware = require("../controllers/middleware");

router.route("/send_code").post(controller.send_code);
router.route("/send_email").post(controller.send_email);
router.route("/verify_code").post(middleware.verify_code, controller.user_data);
router.route("/change_password").post(controller.change_password);
module.exports = router;
