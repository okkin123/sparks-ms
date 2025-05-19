const express = require('express');
const router = express.Router();
const multer = require('multer')

const controller = require("../controllers/quotation_controller");
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


router.route("/generateQuotationNumber").post(controller.generateQuotationNumber);
router.route("/insert").post(middleware.authentication,controller.insert);
router.route("/list").get(middleware.authentication, controller.list);
router.route("/details").post(controller.details);
router.route("/update").post(middleware.authentication,controller.update);
router.route("/get_approval_history").post(controller.get_approval_history);
router.route("/update_quotation_status").post(middleware.authentication, upload.single('file'), controller.update_quotation_status);
router.route("/download_supporting_doc/:filename").get(controller.download_supporting_doc);
router.route("/unlock").post(controller.unlock);
router.route("/invoices_issued").post(controller.invoices_issued);
router.route("/get_quotation_client_details").post(controller.get_quotation_client_details);

module.exports = router;