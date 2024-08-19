
const express = require("express");
const router = express.Router();

const controller = require("../controllers/preferences_controller");

router.route("/trn").get(controller.TRN);
router.route("/setTRN").post(controller.setTRN);
router.route("/bank_account").get(controller.bank_account);

module.exports = router;