
const express = require("express");
const router = express.Router();

const controller = require("../controllers/preferences_controller");

router.route("/company_address").get(controller.company_address);
router.route("/setCompanyAddress").post(controller.setCompanyAddress);
router.route("/trn").get(controller.TRN);
router.route("/setTRN").post(controller.setTRN);
router.route("/currency").get(controller.currency);
router.route("/setCurrency").post(controller.setCurrency);
router.route("/vat").get(controller.VAT);
router.route("/setVAT").post(controller.setVAT);
router.route("/bank_account").get(controller.bank_account);
router.route("/setBankAccount").post(controller.setBankAccount);

module.exports = router;