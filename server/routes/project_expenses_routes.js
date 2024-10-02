const express = require('express');
const router = express.Router();
const multer = require('multer')

const controller = require("../controllers/project_expenses_controller");
const middleware = require("../controllers/middleware");

const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/supplier_invoices/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });

const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/supplier_payments/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload_supplier_invoice = multer({ storage1 });
const upload_supplier_payment = multer({ storage2 });

router.route("/get_supplier_details").get(controller.get_supplier_details)
router.route("/get_invoice_details").get(controller.get_invoice_details)
router.route("/insert").post(middleware.authentication, upload_supplier_invoice.single('file'), controller.insert)
router.route("/list").get(controller.list)
router.route("/details").post(controller.details)
router.route("/insert_payment",middleware.authentication, upload_supplier_payment.single('file'), controller.insert_payment)

module.exports = router;