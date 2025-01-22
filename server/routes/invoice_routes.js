const express = require('express');
const router = express.Router();
const multer = require('multer')

const controller = require("../controllers/invoice_controller");
const middleware = require("../controllers/middleware");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });

const upload = multer({ storage });

router.route("/generateInvoiceNumber").get(controller.generateInvoiceNumber);
router.route("/ref_quotation_numbers").get(controller.ref_quotation_numbers);
router.route("/selected_ref_quotation").post(controller.selected_ref_quotation);
router.route("/insert").post(middleware.authentication,controller.insert);
router.route("/update").post(middleware.authentication,controller.update);
router.route("/list").get(middleware.authentication, controller.list);
router.route("/details").post(controller.details);
router.route("/get_approval_history").post(controller.get_approval_history);
router.route("/update_invoice_status").post(middleware.authentication, upload.single('file'), controller.update_invoice_status);
router.route("/get_invoice_client_details").post(controller.get_invoice_client_details);
router.route("/download_supporting_doc/:filename").get(controller.download_supporting_doc);
router.route("/get_clients").get(controller.get_clients);
router.route("/get_statement").post(controller.get_statement);

module.exports = router;