import express from "express";
import {
  createAuditor,
  getAllAuditors,
  getAuditorById,
  updateAuditor,
  deleteAuditor,
  processProposalsWithOutlets,
  getAuditAdmins,
  saveAuditRecord,
  getAudits,
  getAuditById,
  updateAuditById,
  updateStatusHistoryByAuditId,
  saveLabel,
  addQuestionToLabel,
  fetchLabelsWithQuestions,
  saveAuditResponses,
  updateAuditResponses,
  fetchingQuestionAnswer,
  getUserNameById,
  updateStartedDate,
  deleteAuditById,updateFssaiDetails,auditManagementCount,getAuditorAuditCounts,createCheckListCategory,fetchAllChecklistCategories,updateStepStatus
} from "../controller/auditorController.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

import { generateAuditReport } from "../controller/auditReportGenerationController.js";



// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });



const router = express.Router();

// Public routes
router.post("/createAuditor", createAuditor);

router.get("/getAllAuditors", getAllAuditors);

router.get("/auditors/:id", getAuditorById);

// Protected routes (only for authenticated users)
router.put("/auditors/:id", updateAuditor);

router.delete("/auditors/:id", deleteAuditor);

router.get("/processProposalsWithOutlets", processProposalsWithOutlets);

router.get("/getAuditAdmins", getAuditAdmins);

router.post("/saveAuditRecord", saveAuditRecord);

router.get("/getAllAudits", getAudits);

router.get("/getAuditById/:id", getAuditById);

router.put("/updateAuditById/:id", updateAuditById);

router.put(
  "/updateStatusHistoryByAuditId/:auditId",
  updateStatusHistoryByAuditId
);

// Route to save a new label
router.post("/labels", saveLabel);

router.post("/CheckListCategory", createCheckListCategory);

// Route to add a question to a label
router.post("/questionForLabel", addQuestionToLabel);

router.get("/fetchAllChecklistCategories",fetchAllChecklistCategories);

router.get("/fetchLabelsWithQuestions/:checkListCategoryId", fetchLabelsWithQuestions);

router.get("/fetchingQuestionAnswer/:auditId", fetchingQuestionAnswer);

router.post("/saveAuditResponses", upload.array("files"), saveAuditResponses);

router.post(
  "/updateAuditResponses",
  upload.array("files"),
  updateAuditResponses
);

router.get("/getUserNameById/:userId", getUserNameById);

router.put("/updateStartedDate", updateStartedDate);

router.post("/generateAuditReport", generateAuditReport);

router.delete("/deleteAuditById/:id", deleteAuditById);

router.put("/updateFssaiDetails",  upload.single("file"), updateFssaiDetails);

router.get("/auditManagementCount", auditManagementCount);

router.get("/getAuditorAuditCounts",getAuditorAuditCounts);

router.put("/updateStepsStatus", updateStepStatus);



export default router;
