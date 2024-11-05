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
    cb(null, Date.now() + '- Supplier Invoice.pdf');
  },
});

const storageB = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/payment_supporting_docs/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '- Payment Receipt.pdf');
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
router.route("/get_supplier_payments").get(middleware.authentication, controller.get_supplier_payments)
router.route("/void_supplier_payments").post(middleware.authentication, controller.void_supplier_payments)
router.route("/download_file").post(controller.download_file);
router.route("/void_expense").post(middleware.authentication, controller.void_expense)
router.route("/get_vendor_details").post(controller.get_vendor_details)
router.route("/insert_vendor_expense").post(middleware.authentication, controller.insert_vendor_expense)
router.route("/update_vendor_expense").post(middleware.authentication, controller.update_vendor_expense)
router.route("/delete_vendor_expense").post(controller.delete_vendor_expense)
router.route("/return_vendor_expense").post(controller.return_vendor_expense)
router.route("/verify_vendor_expense").post(controller.verify_vendor_expense)
router.route("/list_vendor_expense").post(middleware.authentication, controller.list_vendor_expense)
router.route("/get_supplier_statement").post(controller.get_supplier_statement);

module.exports = router;