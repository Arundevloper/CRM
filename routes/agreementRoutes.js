import express, { Router } from "express";
import { verifyToken } from "../middleware/auth.js";

import {
  createAgreement,
  deleteFields,
  getAllAgreementDetails,
} from "../controller/agreementController.js";

import { generateagreement } from "../controller/agreementGenerationController.js";

const router = express.Router();

router.delete("/deleteFields", deleteFields);

router.post("/createAgreement", createAgreement);

router.get("/getAllAgreementDetails", getAllAgreementDetails);

router.post("/generateagreement/:agreementId",generateagreement);








export default router;