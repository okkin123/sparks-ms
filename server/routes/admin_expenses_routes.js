const express = require('express');
const router = express.Router();
const multer = require('multer')

const controller = require("../controllers/admin_expenses_controller");
const middleware = require("../controllers/middleware");

router.route("/get_vendor_details").post(controller.get_vendor_details)
router.route("/insert").post(middleware.authentication, controller.insert)

module.exports = router;