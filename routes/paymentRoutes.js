import express, { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getAllProposalDetails,
  saveAuditorPayment,
  getAllProposalDetailsForPayment,
  getAuditorPaymentById,
  updateAuditorPaymentStatus,
  getAllProposalDetailsAdmin,
  deleteFields,
  updateAuditorPayment,
  getAllProposalDetailsWithPayment
} from "../controller/paymentController.js";
import multer from "multer";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/payment-reference");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Define the route with Multer for handling file uploads
router.post(
  "/saveAuditorPayment",
  upload.single("referenceDocument"), 
  saveAuditorPayment
);

router.post("/payments", createPayment);
router.get("/payments", getAllPayments);
router.get("/payments/:id", getPaymentById);


router.get("/getAllProposalDetails/:auditor_id", getAllProposalDetails);

router.get("/getAllProposalDetailsAdmin",getAllProposalDetailsAdmin);

router.get("/getAllProposalDetailsWithPayment",getAllProposalDetailsWithPayment);

router.get("/getAllProposalDetails",getAllProposalDetailsForPayment);

router.get("/getAuditorPaymentById/:id", getAuditorPaymentById);

router.put("/updatePaymentStatus/:id", updateAuditorPaymentStatus);

router.delete("/deleteFields", deleteFields);

router.put("/updateAuditorPayment", upload.single("referenceDocument"),  updateAuditorPayment);

export default router;
