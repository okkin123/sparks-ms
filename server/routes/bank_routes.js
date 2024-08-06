const express = require('express');
const router = express.Router();

const controller = require("../controllers/bank_controller");

router.route("/list").get(controller.list);
router.route("/add").post(controller.add);

module.exports = router;