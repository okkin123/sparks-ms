const express = require('express');
const router = express.Router();
const multer = require('multer')

const controller = require("../controllers/admin_expenses_controller");
const middleware = require("../controllers/middleware");

router.route("/get_vendor_details").post(controller.get_vendor_details)
router.route("/insert").post(middleware.authentication, controller.insert)
router.route("/list").get(middleware.authentication, controller.list)
router.route("/return_admin_expense").post(middleware.authentication, controller.return_admin_expense)
router.route("/verify_admin_expense").post(middleware.authentication, controller.verify_admin_expense)
router.route("/delete_admin_expense").post(controller.delete_admin_expense)
router.route("/update_admin_expense").post(middleware.authentication, controller.update_admin_expense)

module.exports = router;