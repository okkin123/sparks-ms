const express = require('express');
const router = express.Router();

const controller = require("../controllers/quotation_controller");
const middleware = require("../controllers/middleware");

router.route("/generateQuotationNumber").get(controller.generateQuotationNumber);
router.route("/insert").post(middleware.authentication,controller.insert);
router.route("/list").get(middleware.authentication, controller.list);
router.route("/details").post(controller.details);
router.route("/get_approval_history").post(controller.get_approval_history);
router.route("/insert_approval").post(middleware.authentication, controller.insert_approval);

module.exports = router;