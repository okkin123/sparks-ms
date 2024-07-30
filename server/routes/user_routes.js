const express = require("express");
const router = express.Router();

const controller = require("../controllers/user_controller");
const authMiddleware = require("../controllers/auth_middleware");

router.route("/findEmail").post(controller.findEmail);
router.route("/register").post(controller.register);
router.route("/login").post(controller.login);
router.route("/info").get(authMiddleware, controller.info);

module.exports = router;
