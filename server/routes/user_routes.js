const express = require("express");
const router = express.Router();

const controller = require("../controllers/user_controller");
const middleware = require("../controllers/middleware");

router.route("/findEmail").post(controller.findEmail);
router.route("/register").post(controller.register);
router.route("/login").post(controller.login);
router.route("/info").get(middleware.authentication, controller.info);
router
  .route("/get_registration_code")
  .get(middleware.authentication, controller.get_registration_code);

router
  .route("/generate_registration_code")
  .get(middleware.authentication, controller.generate_registration_code);

router.route("/add_registration_code").post(controller.add_registration_code);

router.route("/list").get(middleware.authentication, controller.list);
router.route("/get_user_types").get(middleware.authentication, controller.get_user_types);
router.route("/reporting_to_list").post(controller.reporting_to_list);
router.route("/update_reporting_to").post(controller.update_reporting_to);

module.exports = router;
