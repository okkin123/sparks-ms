const express = require('express');
const router = express.Router();
const multer = require('multer')

const controller = require("../controllers/project_expenses_controller");
const middleware = require("../controllers/middleware");


const storageA = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/supplier_invoices/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const storageB = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/supplier_invoices/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const destA = multer({ storage: storageA });
const destB = multer({ storage: storageB });

router.route("/get_supplier_details").get(controller.get_supplier_details)
router.route("/get_invoice_details").get(controller.get_invoice_details)
router.route("/insert").post(middleware.authentication, destA.single('file'), controller.insert)
router.route("/list").get(controller.list)
router.route("/details").post(controller.details)
router.route("/insert_payment").post(middleware.authentication, destB.single('file'), controller.insert_payment)
router.route("/payments").post(controller.payments)

module.exports = router;