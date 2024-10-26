const express = require('express');
const router = express.Router();
const multer = require('multer')

const controller = require("../controllers/admin_expenses_controller");
const middleware = require("../controllers/middleware");

router.route("/insert").post(middleware.authentication, controller.insert)
router.route("/update").post(controller.update)
router.route("/delete").post(controller.delete)
router.route("/list").get(controller.list)

module.exports = router;