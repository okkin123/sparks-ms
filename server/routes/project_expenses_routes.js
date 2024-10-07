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
    cb(null, 'uploads/payment_receipts/');
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
router.route("/details").post(middleware.authentication, controller.details)
router.route("/insert_payment").post(middleware.authentication, destB.single('file'), controller.insert_payment)
router.route("/payments").post(middleware.authentication,controller.payments)
router.route("/download_supporting_doc/:filename").get(controller.download_supporting_doc);
router.route("/void_payment").post(middleware.authentication, controller.void_payment)
router.route("/void_expense").post(middleware.authentication, controller.void_expense)

module.exports = router;