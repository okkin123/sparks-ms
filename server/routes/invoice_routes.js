const express = require('express');
const router = express.Router();

const controller = require("../controllers/invoice_controller");

router.route("/generateInvoiceNumber").get(controller.generateInvoiceNumber);
router.route("/ref_quotation_numbers").get(controller.ref_quotation_numbers);
router.route("/selected_ref_quotation").post(controller.selected_ref_quotation);

module.exports = router;