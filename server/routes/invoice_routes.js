const express = require('express');
const router = express.Router();

const controller = require("../controllers/invoice_controller");
const middleware = require("../controllers/middleware");

router.route("/generateInvoiceNumber").get(controller.generateInvoiceNumber);
router.route("/ref_quotation_numbers").get(controller.ref_quotation_numbers);
router.route("/selected_ref_quotation").post(controller.selected_ref_quotation);
router.route("/insert").post(middleware.authentication,controller.insert);
module.exports = router;