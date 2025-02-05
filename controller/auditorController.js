import Proposal from "../models/proposalModel.js";
import Auditor from "../models/auditorModel.js";
import moment from "moment";
import { User, userRoles } from "../models/usersModel.js";
import AuditManagement from "../models/auditMangement.js";
import Question from "../models/questionSchema.js";
import Label from "../models/labelModel.js";
import CheckListCategory from "../models/checkListCategoryModel.js";
import AuditResponse from "../models/auditReponseModel.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../helper/uploadToCloudinary.js";

// Create a new auditor
export const createAuditor = async (req, res) => {
  try {
    const { auditor_name } = req.body;
    if (!auditor_name) {
      return res.status(400).json({ message: "Auditor name is required" });
    }

    const newAuditor = new Auditor({ auditor_name });
    await newAuditor.save();
    res.status(201).json(newAuditor);
  } catch (error) {
    res.status(500).json({ message: "Error creating auditor", error });
  }
};

// Get all auditors
export const getAllAuditors = async (req, res) => {
  try {
    const auditors = await Auditor.find();
    res.status(200).json(auditors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching auditors", error });
  }
};

// Get a single auditor by ID
export const getAuditorById = async (req, res) => {
  try {
    const { id } = req.params;
    const auditor = await Auditor.findById(id);

    if (!auditor) {
      return res.status(404).json({ message: "Auditor not found" });
    }

    res.status(200).json(auditor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching auditor", error });
  }
};

// Update an auditor by ID
export const updateAuditor = async (req, res) => {
  try {
    const { id } = req.params;
    const { auditor_name } = req.body;

    const updatedAuditor = await Auditor.findByIdAndUpdate(
      id,
      { auditor_name },
      { new: true }
    );

    if (!updatedAuditor) {
      return res.status(404).json({ message: "Auditor not found" });
    }

    res.status(200).json(updatedAuditor);
  } catch (error) {
    res.status(500).json({ message: "Error updating auditor", error });
  }
};

// Delete an auditor by ID
export const deleteAuditor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAuditor = await Auditor.findByIdAndDelete(id);

    if (!deletedAuditor) {
      return res.status(404).json({ message: "Auditor not found" });
    }

    res.status(200).json({ message: "Auditor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting auditor", error });
  }
};

// Function to send outlet data to an external API
const sendOutletData = async (outletData) => {
  try {
    const response = await axios.post(
      "https://example.com/api/outlet",
      outletData
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      `Error sending outlet data for ${outletData.outletName}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
};

// export const processProposalsWithOutlets = async (req, res) => {
//   try {
//     const { page = 1, pageSize = 10, sort, keyword } = req.query;

//     // Convert page and pageSize to integers
//     const pageNumber = parseInt(page, 10);
//     const sizePerPage = parseInt(pageSize, 10);

//     if (
//       isNaN(pageNumber) ||
//       pageNumber < 1 ||
//       isNaN(sizePerPage) ||
//       sizePerPage < 1
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Invalid page or pageSize parameter" });
//     }

//     // Base query
//     let query = Proposal.find().populate("enquiryId");

//     // Apply search filter if a keyword is provided
//     if (keyword) {
//       const searchRegex = new RegExp(keyword, "i"); // Case-insensitive search
//       query = query.where("fbo_name").regex(searchRegex);
//     }

//     // Sorting logic
//     let sortQuery = {};
//     switch (sort) {
//       case "newproposal":
//         sortQuery = { createdAt: -1 }; // Newest first
//         break;
//       case "oldproposal":
//         sortQuery = { createdAt: 1 }; // Oldest first
//         break;
//       default:
//         sortQuery = { createdAt: 1 }; // Default sorting (oldest first)
//     }

//     // Fetch all matching proposals
//     const proposals = await query.sort(sortQuery);

//     // Flatten all outlets into a single array
//     const allOutlets = [];
//     proposals.forEach((proposal) => {
//       let auditCounter = 1; // Reset counter for each proposal
//       proposal.outlets.forEach((outlet) => {
//         let location = proposal.address?.line2
//           ?.replace(/,/, "/")
//           .replace(/\s+/g, "");

//         // Filter outlets with description "Hygiene Rating" and unassigned auditors
//         if (
//           outlet.is_assignedAuditor === false &&
//           outlet.description === "Hygiene Rating"
//         ) {
//           allOutlets.push({
//             audit_number: `${auditCounter}`, // Include the audit counter in the response
//             proposal_number: proposal.proposal_number,
//             fbo_name: proposal.fbo_name,
//             outlet_name: outlet.outlet_name,
//             outlet_id: outlet._id,
//             proposal_id: proposal._id,
//             amount: outlet.amount,
//             status: outlet.is_assignedAuditor,
//             date_time: moment(proposal.createdAt).format(
//               "MMMM Do YYYY, h:mm A" // Format: "November 22nd 2024, 3:45 PM"
//             ),
//             service: "Hygiene Rating", // Set service as "Hygiene Rating"
//             location: location,
//           });

//           // Increment audit counter
//         }

//         if (outlet.description === "Hygiene Rating") {
//           auditCounter++;
//         }
//       });
//     });

//     // Total number of outlets
//     const totalOutlets = allOutlets.length;

//     // Paginate outlets
//     const paginatedOutlets = allOutlets.slice(
//       (pageNumber - 1) * sizePerPage,
//       pageNumber * sizePerPage
//     );

//     // Total pages
//     const totalPages = Math.ceil(totalOutlets / sizePerPage);

//     res.status(200).json({
//       message: "Processed all proposals and outlets successfully",
//       total: totalOutlets,
//       totalpages: totalPages, // Correct total pages
//       currentPage: pageNumber,
//       data: paginatedOutlets,
//     });
//   } catch (error) {
//     console.error("Error processing proposals and outlets:", error);
//     res
//       .status(500)
//       .json({ message: "Error processing proposals and outlets", error });
//   }
// };

export const processProposalsWithOutlets = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, sort, keyword } = req.query;

    // Convert page and pageSize to integers
    const pageNumber = parseInt(page, 10);
    const sizePerPage = parseInt(pageSize, 10);

    if (
      isNaN(pageNumber) ||
      pageNumber < 1 ||
      isNaN(sizePerPage) ||
      sizePerPage < 1
    ) {
      return res
        .status(400)
        .json({ message: "Invalid page or pageSize parameter" });
    }

    // Base query
    let query = Proposal.find().populate("enquiryId");

    // Apply search filter if a keyword is provided
    if (keyword) {
      const searchRegex = new RegExp(keyword, "i"); // Case-insensitive search
      query = query.where("fbo_name").regex(searchRegex);
    }

    // Sorting logic
    let sortQuery = {};
    switch (sort) {
      case "newproposal":
        sortQuery = { createdAt: -1 }; // Newest first
        break;
      case "oldproposal":
        sortQuery = { createdAt: 1 }; // Oldest first
        break;
      default:
        sortQuery = { createdAt: 1 }; // Default sorting (oldest first)
    }

    // Fetch all matching proposals
    const proposals = await query.sort(sortQuery);

    // Flatten all outlets into a single array
    const allOutlets = [];
    proposals.forEach((proposal) => {
      let auditCounter = 1; // Reset counter for each proposal
      proposal.outlets.forEach((outlet) => {
        let location = proposal.address?.line2
          ?.replace(/,/, "/")
          .replace(/\s+/g, "");

        // Filter outlets with description "Hygiene Rating" and unassigned auditors
        if (outlet.is_assignedAuditor === false) {
          allOutlets.push({
            audit_number: `${auditCounter}`, // Include the audit counter in the response
            proposal_number: proposal.proposal_number,
            fbo_name: proposal.fbo_name,
            outlet_name: outlet.outlet_name,
            outlet_id: outlet._id,
            proposal_id: proposal._id,
            amount: outlet.amount,
            status: outlet.is_assignedAuditor,
            customer_type: proposal.customer_type,
            date_time: moment(proposal.createdAt).format(
              "MMMM Do YYYY, h:mm A" // Format: "November 22nd 2024, 3:45 PM"
            ),
            service: outlet.description || "",

            location: location,
          });

          // Increment audit counter
        }

        auditCounter++;
      });
    });

    // Total number of outlets
    const totalOutlets = allOutlets.length;

    // Paginate outlets
    const paginatedOutlets = allOutlets.slice(
      (pageNumber - 1) * sizePerPage,
      pageNumber * sizePerPage
    );

    // Total pages
    const totalPages = Math.ceil(totalOutlets / sizePerPage);

    res.status(200).json({
      message: "Processed all proposals and outlets successfully",
      total: totalOutlets,
      totalpages: totalPages, // Correct total pages
      currentPage: pageNumber,
      data: paginatedOutlets,
    });
  } catch (error) {
    console.error("Error processing proposals and outlets:", error);
    res
      .status(500)
      .json({ message: "Error processing proposals and outlets", error });
  }
};

export const updateOutletAssignedAuditor = async (req, res) => {
  const { proposalId, outletId } = req.params;

  try {
    // Update the specific outlet in the proposal
    const updatedProposal = await Proposal.updateOne(
      {
        _id: proposalId,
        "outlets._id": outletId, // Find proposal and matching outlet
      },
      {
        $set: { "outlets.$.is_assignedAuditor": true }, // Update the outlet's `is_assignedAuditor`
      }
    );

    // Check if any documents were modified
    if (updatedProposal.nModified === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching proposal or outlet found to update.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Outlet updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update outlet.",
      error: error.message,
    });
  }
};

// Controller to get all users with the 'AUDIT_ADMIN' role and only _id and userName fields
export const getAuditAdmins = async (req, res) => {
  try {
    // Query to fetch users with the role 'AUDIT_ADMIN' and select only _id and userName
    const auditAdmins = await User.find({ role: userRoles.AUDITOR }).select(
      "_id userName"
    );

    // Respond with the list of users
    res.status(200).json({
      success: true,
      message: "Fetched all AUDIT_ADMIN users successfully",
      data: auditAdmins,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Failed to fetch AUDIT_ADMIN users",
      error: error.message,
    });
  }
};

// Controller to save a new audit record
export const saveAuditRecord = async (req, res) => {
  console.log(req.body);
  console.log("this is the body");

  try {
    // Extract data from the request body
    const {
      user,
      proposalId,
      outletId,
      fbo_name,
      outlet_name,
      status,
      assigned_date,
      location,
      audit_number,
      proposal_number,
      service,
      customer_type,
    } = req.body;

    // Update the outlet to mark it as assigned to an auditor
    const updatedProposal = await Proposal.updateOne(
      {
        _id: proposalId,
        "outlets._id": outletId, // Match the outlet in the proposal
      },
      {
        $set: { "outlets.$.is_assignedAuditor": true }, // Update the flag
      }
    );

    // Check if the update was successful
    if (updatedProposal.nModified === 0) {
      return res.status(404).json({
        success: false,
        message: "Failed to update outlet. Proposal or outlet not found.",
      });
    }

    console.log("Outlet updated successfully!");

    // Create a new audit instance
    const newAudit = new AuditManagement({
      proposalId,
      outletId,
      fbo_name,
      outlet_name,
      status,
      assigned_date,
      started_at: null,
      location,
      audit_number,
      user,
      proposal_number,
      service,
      customer_type,
    });

    // Save the audit record to the database
    const savedAudit = await newAudit.save();

    // Respond with the saved record
    res.status(201).json({
      success: true,
      message: "Audit record saved successfully and outlet updated.",
      data: savedAudit,
    });
  } catch (error) {
    // Handle errors, including duplicate audit_number or validation issues
    res.status(400).json({
      success: false,
      message: "Failed to save audit record.",
      error: error.message,
    });
  }
};

export const getAudits = async (req, res) => {
  try {
    const { status, userId, searchQuery, page = 1, perPage = 10 } = req.query;

    // Parse page and perPage to integers
    const pageNum = parseInt(page, 10) || 1; // Default to page 1 if invalid
    const perPageNum = parseInt(perPage, 10) || 10; // Default to 10 items per page if invalid

    // Build the query dynamically based on provided parameters
    const query = {};

    if (status) query.status = status; // Filter by status if provided
    if (userId) query.user = userId; // Filter by user ID if provided

    // Search functionality: If a searchQuery is provided, filter based on relevant fields
    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i"); // Case-insensitive search
      query.$or = [
        { outlet_name: { $regex: regex } },
        { fbo_name: { $regex: regex } },
        { location: { $regex: regex } },
        { audit_number: { $regex: regex } },
      ];
    }

    // Calculate pagination skip value
    const skip = (pageNum - 1) * perPageNum;

    // Fetch audits matching the query with pagination
    const audits = await AuditManagement.find(query)
      .skip(skip) // Skip to the page
      .limit(perPageNum) // Limit the number of records returned
      .populate("user", "userName") // Populate user field with userName from User model
      .populate("proposalId", "proposal_number"); // Populate proposalId field with proposal_number from Proposal model

    // Get the total count of matching audits for pagination
    const totalCount = await AuditManagement.countDocuments(query);

    // Map the audits to return the necessary data (userName, proposal_number, and all audit data)
    const response = audits.map((audit) => ({
      _id: audit._id,
      userName: audit.user ? audit.user.userName : null, // Add userName from populated user
      proposal_number: audit.proposalId
        ? audit.proposalId.proposal_number
        : null, // Add proposal_number from populated proposalId
      outletId: audit.outletId,
      fbo_name: audit.fbo_name,
      outlet_name: audit.outlet_name,
      status: audit.status,
      started_at: audit.started_at,
      location: audit.location,
      audit_number: audit.audit_number,
      status_changed_at: audit.status_changed_at,
      customer_type: audit.customer_type,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt,
      service: audit.service,
      __v: audit.__v,
    }));

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCount / perPageNum);

    // Respond with the filtered audits and pagination data
    res.status(200).json({
      success: true,
      message: "Audits retrieved successfully.",
      data: response,
      pagination: {
        page: pageNum,
        perPage: perPageNum,
        total: totalCount,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Failed to retrieve audits.",
      error: error.message,
    });
  }
};

export const getAuditById = async (req, res) => {
  try {
    const { id } = req.params; // Extract the audit ID from the route parameters

    // Base query for finding the audit
    let query = AuditManagement.findById(id)
      .populate("user", "userName") // Populate the user field with userName from User model
      .populate("proposalId", "proposal_number"); // Populate the proposalId field with proposal_number from Proposal model

    // Check if `checklistCategory` is present and populate it
    const auditWithChecklist = await AuditManagement.findById(id);
    if (auditWithChecklist && auditWithChecklist.checklistCategory) {
      query = query.populate("checklistCategory", "name");
    }

    const audit = await query;

    // Check if the audit exists
    if (!audit) {
      return res.status(404).json({
        success: false,
        message: "Audit not found.",
      });
    }

    // Format the response using moment for all date fields
    const formatDateTime = (date) =>
      date ? moment(date).format("DD-MM-YYYY HH:mm:ss") : null;

    const response = {
      userName: audit.user ? audit.user.userName : null, // Add userName from populated user
      proposal_number: audit.proposalId
        ? audit.proposalId.proposal_number
        : null, // Add proposal_number from populated proposalId
      outletId: audit.outletId,
      fbo_name: audit.fbo_name,
      outlet_name: audit.outlet_name,
      status: audit.status,
      started_at: audit.started_at, // Format started_at
      location: audit.location,
      audit_number: audit.audit_number,
      proposal_number: audit.proposal_number,
      audit_comments: audit.audit_comments, // Include the new field here
      status_changed_at: formatDateTime(audit.status_changed_at), // Format status_changed_at
      statusHistory: audit.statusHistory || null,
      modificationHistory: audit.modificationHistory || null,
      fssai_image_url: audit.fssai_image_url ? audit.fssai_image_url : null,
      fssai_number: audit.fssai_number ? audit.fssai_number : null,
      assigned_date: audit.assigned_date || null,
      checkListId: audit.checklistCategory || null,
      __v: audit.__v,
    };

    // Respond with the audit details
    res.status(200).json({
      success: true,
      message: "Audit retrieved successfully.",
      data: response,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Failed to retrieve audit.",
      error: error.message,
    });
  }
};

export const updateAuditById = async (req, res) => {
  console.log(req.body);
  try {
    const { id } = req.params; // Extract the audit ID from the route parameters
    const updates = req.body; // Extract the updates from the request body

    // Find the audit document by ID
    const audit = await AuditManagement.findById(id);

    // Check if the audit exists
    if (!audit) {
      return res.status(404).json({
        success: false,
        message: "Audit not found.",
      });
    }

    // Update the allowed fields
    if (updates.status) audit.status = updates.status;
    if (updates.audit_comments) audit.audit_comments = updates.audit_comments;
    if (updates.started_at) audit.started_at = updates.started_at;
    if (updates.location) audit.location = updates.location;
    if (updates.status_changed_at)
      audit.status_changed_at = updates.status_changed_at;

    // Add new fields
    if (updates.fbo_name) audit.fbo_name = updates.fbo_name;
    if (updates.outlet_name) audit.outlet_name = updates.outlet_name;
    if (updates.proposal_number)
      audit.proposal_number = updates.proposal_number;
    if (updates.audit_number) audit.audit_number = updates.audit_number;
    if (updates.user) audit.user = updates.user;

    // Optionally add to modification history
    audit.modificationHistory = audit.modificationHistory || [];
    audit.modificationHistory.push({
      modifiedAt: new Date(),
      changes: updates,
    });

    // Save the updated audit
    const updatedAudit = await audit.save();

    // Respond with the updated audit details
    res.status(200).json({
      success: true,
      message: "Audit updated successfully.",
      data: updatedAudit,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Failed to update audit.",
      error: error.message,
    });
  }
};

export const updateStatusHistoryByAuditId = async (req, res) => {
  console.log(req.body);
  const { auditId } = req.params; // Get the auditId from the URL params
  const { status, comment, userId } = req.body; // Get status, comment, and userId from the request body

  try {
    // Validate the status field
    if (
      !["assigned", "draft", "modified", "submitted", "approved"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // Find the AuditManagement document by auditId
    const audit = await AuditManagement.findById(auditId);

    // If audit not found, return a 404 error
    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    audit.status = status;

    // Create the status history entry
    const statusHistoryEntry = {
      status,
      changedAt: new Date(), // Set the current time
      // Only add comment and userId if the status is 'rejected' or 'approved'
      ...(status === "modified" || status === "approved"
        ? { comment, userId }
        : {}),
    };

    // Add the new status history entry to the statusHistory array
    audit.statusHistory.push(statusHistoryEntry);

    // Save the updated AuditManagement document
    await audit.save();

    // Return a success response with the updated audit
    return res.status(200).json({
      success: true,
      message: "Status history updated successfully",
      audit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating status history",
    });
  }
};

export const createCheckListCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Check if a category with the same name already exists
    const existingCategory = await CheckListCategory.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    // Assuming your Mongoose model is named CheckListCategory
    const category = new CheckListCategory({ name });
    await category.save();

    res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error Creating Category:", error);
    res.status(500).json({ message: "Failed to create category", error });
  }
};

export const saveLabel = async (req, res) => {
  try {
    const { name, checklistCategory } = req.body;

    // Check if the name and checklistCategory are provided
    if (!name) {
      return res.status(400).json({ message: "Label name is required." });
    }
    if (!checklistCategory) {
      return res
        .status(400)
        .json({ message: "Checklist Category is required." });
    }

    // Create and save the new Label
    const label = new Label({ name, checklistCategory });
    await label.save();

    // Send response back
    res.status(201).json({
      message: "Label created successfully",
      data: label,
    });
  } catch (error) {
    console.error("Error saving label:", error);
    res.status(500).json({ message: "Failed to create label", error });
  }
};

export const addQuestionToLabel = async (req, res) => {
  try {
    const { labelId, questions } = req.body;

    //Validate that the question array is not empty
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions array is required." });
    }

    //Intiliaze an array to store the questions
    const questionArray = [];

    //Iterate through the questions array and create a new question object
    questions.forEach((question) => {
      const { question_text, marks } = question;
      const newQuestion = new Question({
        question_text,
        marks,
        label: labelId,
      });
      questionArray.push(newQuestion);
    });

    //Save the questions to the database
    const savedQuestions = await Question.insertMany(questionArray);

    res.status(201).json({
      message: "Question added to label successfully",
      data: savedQuestions,
    });
  } catch (error) {
    console.error("Error adding question to label:", error);
    res.status(500).json({ message: "Failed to add question to label", error });
  }
};

export const fetchAllChecklistCategories = async (req, res) => {
  try {
    //fetch alll the checklist categories

    const checklistCategories = await CheckListCategory.find();

    res.status(200).json(checklistCategories);
  } catch (error) {
    console.error("Error fetching checklist categories:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch checklist categories", error });
  }
};

// Fetch all labels with their associated questions, including numbering
export const fetchLabelsWithQuestions = async (req, res) => {
  try {
    const { checkListCategoryId } = req.params;

    //fetch all the label with the category id
    const labels = await Label.find({ checklistCategory: checkListCategoryId });

    // Fetch associated questions for each label and map to the desired format
    const data = await Promise.all(
      labels.map(async (label) => {
        const questions = await Question.find({ label: label._id });

        return {
          title: label.name, // Use label name as the title
          questions: questions.map((question, index) => ({
            questionId: question._id, // Include question ID
            description: `${index + 1}. ${question.question_text}`, // Add numbering to the question text
            mark: question.marks, // Include marks
          })),
        };
      })
    );

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching labels with questions:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch labels with questions", error });
  }
};

// Configure multer for file handling
// const upload = multer({ dest: "uploads/" }); // Temp storage

// export const saveAuditResponses = async (req, res) => {
//   console.log(req.body);
//   console.log(req.files);
//   const { data, files } = req.body;

//   try {
//     const parsedData = JSON.parse(data); // Parse the JSON data for responses
//     const { auditId, responses, status } = parsedData;

//     // Save responses with file uploads
//     const savedResponses = await Promise.all(
//       responses.map(async (response) => {
//         const { questionId, comment, marks, file } = response;

//         let uploadedImageUrl = "";
//         if (file) {
//           // Find the corresponding file uploaded
//           const uploadedFile = files.find((f) => f.originalname === file);
//           if (uploadedFile) {
//             try {
//               // Upload to Cloudinary
//               const uploadResult = await cloudinary.uploader.upload(
//                 uploadedFile.path,
//                 {
//                   folder: "audit_images",
//                 }
//               );
//               uploadedImageUrl = uploadResult.secure_url;

//               // Optionally remove the temp file after upload
//               fs.unlinkSync(uploadedFile.path);
//             } catch (error) {
//               console.error("Image upload failed:", error.message);
//               throw new Error("Failed to upload image.");
//             }
//           }
//         }

//         // Save the audit response in DB
//         const auditResponse = new AuditResponse({
//           audit: auditId,
//           question: questionId,
//           comment,
//           marks,
//           image_url: uploadedImageUrl,
//         });

//         return auditResponse.save();
//       })
//     );

//     // Call `updateStatusHistoryByAuditId` to update the status
//     const audit = await AuditManagement.findById(auditId);

//     if (!audit) {
//       throw new Error("Audit not found.");
//     }

//     // Update the status and add status history
//     audit.status = status; // Use the status from the request
//     audit.statusHistory.push({
//       status,
//       changedAt: new Date(),
//     });

//     await audit.save(); // Save changes

//     res.status(200).json({
//       message: "Audit responses saved successfully, and status updated.",
//       data: savedResponses,
//     });
//   } catch (error) {
//     console.error("Error saving audit responses:", error.message);
//     res.status(400).json({
//       message: "Invalid request body or failed to process responses.",
//       error: error.message,
//     });
//   }
// };

// // Middleware for handling file uploads
// export const handleFileUpload = upload.single("image"); // Expecting an `image` field

// Configure Multer for file upload
// Helper function for uploading files to Cloudinary

export const saveAuditResponses = async (req, res) => {
  const { data } = req.body;
  const files = req.files;

  if (!data || !files) {
    return res
      .status(400)
      .json({ message: "Invalid request. Missing data or files." });
  }

  try {
    console.log("Files received:", files); // Debugging

    const parsedData = JSON.parse(data);
    const { auditId, responses, status, fssai_number, fssai_file } = parsedData;

    const uploadedFiles = {};

    // Upload all files to Cloudinary first and map them
    await Promise.all(
      files.map(async (file) => {
        const uploadedResult = await uploadToCloudinary(
          file.buffer,
          "audit_files"
        );
        uploadedFiles[file.originalname] = uploadedResult.secure_url; // Map file names to their URLs
      })
    );

    console.log("Uploaded files:", uploadedFiles); // Debugging

    // Save responses
    const savedResponses = await Promise.all(
      responses.map(async ({ questionId, comment, marks, file }) => {
        const uploadedImageUrl = file ? uploadedFiles[file] || "" : "";

        const auditResponse = new AuditResponse({
          audit: auditId,
          question: questionId,
          comment,
          marks,
          image_url: uploadedImageUrl,
        });

        return auditResponse.save();
      })
    );

    // Update audit record
    const audit = await AuditManagement.findById(auditId);
    if (!audit) {
      throw new Error("Audit not found.");
    }

    audit.status = status;
    audit.statusHistory.push({ status, changedAt: new Date() });
    audit.fssai_number = fssai_number;

    if (fssai_file) {
      audit.fssai_image_url = uploadedFiles[fssai_file] || "";
    }

    await audit.save();

    res.status(200).json({
      message: "Audit responses, FSSAI details, and status saved successfully.",
      data: savedResponses,
    });
  } catch (error) {
    console.error("Error saving audit responses:", error.message);
    res.status(500).json({
      message: "An error occurred while processing the audit responses.",
      error: error.message,
    });
  }
};

export const updateAuditResponses = async (req, res) => {
  try {
    console.log(req.body); // Contains form data like 'data'
    console.log(req.files); // Contains the uploaded files
    req.files.forEach((file) => {
      console.log(file); // Logs each file object
    });
    const { data } = req.body; // 'data' is the JSON part of the form
    const files = req.files;

    if (!data || !files) {
      return res
        .status(400)
        .json({ message: "Missing required data or files." });
    }

    // Parse `data`
    const parsedData = JSON.parse(data);
    const { auditId, responses } = parsedData;

    if (!auditId || !responses) {
      return res.status(400).json({ message: "Invalid request payload." });
    }

    const updatedResponses = [];

    for (const response of responses) {
      const { questionId, comment, selectedMark, file } = response;

      // Search for the existing AuditResponse by both auditId and questionId
      const auditResponse = await AuditResponse.findOne({
        audit: auditId,
        question: questionId,
      });

      if (!auditResponse) {
        return res.status(404).json({
          message: `Audit response for auditId ${auditId} and questionId ${questionId} not found.`,
        });
      }

      let uploadedImageUrl = auditResponse.image_url; // Use the existing image URL by default

      // If file is provided and it's not a Cloudinary URL, upload it
      if (file && !file.startsWith("https://res.cloudinary.com")) {
        const uploadedFile = files.find((f) => f.originalname === file);
        if (uploadedFile) {
          console.log("Processing file:", uploadedFile);

          try {
            // Uploading file buffer to Cloudinary
            const uploadResult = await uploadToCloudinary(
              uploadedFile.buffer,
              "audit_images"
            );
            uploadedImageUrl = uploadResult.secure_url;
          } catch (error) {
            console.error(
              `Failed to upload image for questionId ${questionId}:`,
              error.message
            );
          }
        }
      }

      // Only update fields that are provided in the request
      const updateFields = {
        ...(comment && { comment }),
        ...(selectedMark && { marks: selectedMark }),
        ...(uploadedImageUrl && { image_url: uploadedImageUrl }),
      };

      // Update the response in the AuditResponse collection
      await AuditResponse.updateOne(
        { audit: auditId, question: questionId },
        { $set: updateFields }
      );

      // Store the updated response to return later
      updatedResponses.push({
        questionId,
        comment: comment || auditResponse.comment, // If no new comment, keep existing
        marks: selectedMark || auditResponse.marks, // If no new marks, keep existing
        image_url: uploadedImageUrl || auditResponse.image_url, // If no new file URL, keep existing
      });
    }

    // Send the response only once after all updates are completed
    return res.status(200).json({
      message: "Audit responses and status updated successfully.",
      data: updatedResponses,
    });
  } catch (error) {
    console.error("Error processing audit responses:", error.message);
    // Ensure only one response is sent
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to process responses.",
        error: error.message,
      });
    }
  }
};

export const fetchingQuestionAnswer = async (req, res) => {
  try {
    const { auditId } = req.params; // Extract auditId from request parameters

    const { checkListId } = req.query;

    if (!auditId) {
      return res.status(400).json({ message: "Audit ID is required" });
    }

    //fetch all the label with the category id
    const labels = await Label.find({ checklistCategory: checkListId });

    // Fetch associated questions for each label and map to the desired format
    const data = await Promise.all(
      labels.map(async (label) => {
        const questions = await Question.find({ label: label._id });

        // Map questions and populate answers from AuditResponse
        const questionsWithAnswers = await Promise.all(
          questions.map(async (question, index) => {
            const auditResponse = await AuditResponse.findOne({
              audit: auditId,
              question: question._id,
            });

            return {
              questionId: question._id,
              description: `${index + 1}. ${question.question_text}`,
              mark: question.marks,
              comment: auditResponse ? auditResponse.comment : "", // Populate comment if it exists
              marks: auditResponse ? auditResponse.marks : "", // Populate marks if it exists
              image_url: auditResponse ? auditResponse.image_url : "", // Populate image URL if it exists
            };
          })
        );

        return {
          title: label.name, // Use label name as the title
          questions: questionsWithAnswers,
        };
      })
    );

    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Error fetching labels with questions and audit responses:",
      error
    );
    res.status(500).json({
      message: "Failed to fetch labels with questions and audit responses",
      error,
    });
  }
};

export const getUserNameById = async (req, res) => {
  try {
    const { userId } = req.params; // assuming the userId is passed as a route parameter

    // Find the user by ObjectId
    const user = await User.findById(userId);

    // If the user does not exist, send an error response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the userName
    res.json({ userName: user.userName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateStartedDate = async (req, res) => {
  console.log(req.body);
  const { audit_id, checkListId } = req.body; // Get audit_id and checkListId from request body

  try {
    // Get the current date and time
    const currentDateTime = moment().toISOString(); // Formats as ISO string for compatibility with MongoDB

    // Find the AuditManagement record by ID and update the `started_at` and `checklistCategory` fields
    const updatedAuditManagement = await AuditManagement.findByIdAndUpdate(
      audit_id,
      {
        started_at: currentDateTime,
        checklistCategory: checkListId,
      },
      { new: true, runValidators: true } // Return the updated document and ensure validations
    );

    // Check if the record exists
    if (!updatedAuditManagement) {
      return res
        .status(404)
        .json({ message: "AuditManagement record not found" });
    }

    // Respond with the updated record
    res.status(200).json({
      message: "AuditManagement started_at updated successfully",
      data: updatedAuditManagement,
    });
  } catch (error) {
    console.error("Error updating started_at:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Controller to delete an AuditManagement document and its associated responses
export const deleteAuditById = async (req, res) => {
  const { id } = req.params; // Extract the audit ID from the request parameters

  try {
    // Check if the AuditManagement document exists
    const audit = await AuditManagement.findById(id);

    if (!audit) {
      return res.status(404).json({ message: "Audit not found" });
    }

    // Delete all AuditResponse documents with the matching audit_id
    const responseDeleteResult = await AuditResponse.deleteMany({
      audit_id: id,
    });

    // Delete the AuditManagement document
    const auditDeleteResult = await AuditManagement.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Audit and associated responses deleted successfully",
      auditDeleted: auditDeleteResult,
      responsesDeletedCount: responseDeleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting audit:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// Update FSSAI Details Handler
export const updateFssaiDetails = async (req, res) => {
  console.log(req.body);
  const { fssai_number, audit_id, deleteImage } = req.body;

  try {
    // Validate audit_id
    if (!audit_id) {
      return res.status(400).json({ message: "Audit ID is required." });
    }

    // Check if the record exists
    const existingRecord = await AuditManagement.findById(audit_id);
    if (!existingRecord) {
      return res.status(404).json({ message: "FSSAI record not found." });
    }

    // Handle image deletion
    if (deleteImage === "true" && existingRecord.fssai_image_url) {
      try {
        const publicId = existingRecord.fssai_image_url
          .replace(/^.*\/audit_images\//, "audit_images/") // Keep folder + filename
          .split(".")[0]; // Remove file extension

        console.log("Extracted publicId:", publicId);

        console.log(publicId);
        await deleteFromCloudinary(publicId);
      } catch (deleteError) {
        console.error("Error deleting file from Cloudinary:", deleteError);
        return res.status(500).json({ message: "Image deletion failed." });
      }
    }

    // Handle file upload
    let uploadedImageUrl = "";
    if (req.file && req.file.buffer) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "audit_images"
        );
        uploadedImageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading file to Cloudinary:", uploadError);
        return res.status(500).json({ message: "File upload failed." });
      }
    }

    // Prepare update data
    const updateData = { fssai_number };
    if (uploadedImageUrl) {
      updateData.fssai_image_url = uploadedImageUrl;
    } else if (deleteImage === "true") {
      updateData.fssai_image_url = "";
    }

    // Update the record
    const updatedRecord = await AuditManagement.findByIdAndUpdate(
      audit_id,
      updateData,
      { new: true }
    );

    // Success Response
    return res.status(200).json({
      message: "FSSAI details updated successfully.",
      updatedRecord,
    });
  } catch (err) {
    console.error("Error updating FSSAI details:", err);
    return res.status(500).json({
      message: "An error occurred while updating FSSAI details.",
    });
  }
};

const getDateRanges = (filter) => {
  switch (filter) {
    case "today":
      return {
        start: moment().startOf("day").toDate(),
        end: moment().endOf("day").toDate(),
      };
    case "week":
      return {
        start: moment().startOf("week").toDate(),
        end: moment().endOf("week").toDate(),
      };
    case "month":
      return {
        start: moment().startOf("month").toDate(),
        end: moment().endOf("month").toDate(),
      };
    case "overall":
      return null; // No date range for overall count
    default:
      throw new Error("Invalid filter");
  }
};

export const auditManagementCount = async (req, res) => {
  try {
    const { filter } = req.query;

    const dateRange = getDateRanges(filter);

    let count;
    const query = { "statusHistory.status": "approved" };

    if (dateRange) {
      query.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
    }

    // Using $elemMatch to ensure we query statusHistory array
    count = await AuditManagement.countDocuments(query);

    console.log("Count result:", count);

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error counting audit management records:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to count audit management records",
      error: error.message,
    });
  }
};

export const getAuditorAuditCounts = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query;

    const pageNumber = parseInt(page, 10);
    const sizePerPage = parseInt(pageSize, 10);

    if (
      isNaN(pageNumber) ||
      pageNumber < 1 ||
      isNaN(sizePerPage) ||
      sizePerPage < 1
    ) {
      return res
        .status(400)
        .json({ message: "Invalid page or pageSize parameter" });
    }

    // Base match filter
    const matchFilter = {
      status: { $ne: "assigned" }, // Exclude "assigned" audits
    };

    // Add keyword search to the filter
    if (keyword) {
      const searchRegex = new RegExp(keyword, "i");
      matchFilter["userName"] = searchRegex; // Filter by userName
    }

    // Aggregation pipeline for fetching audits
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $addFields: {
          lastStatus: { $arrayElemAt: ["$statusHistory", -1] }, // Get the last entry in statusHistory
        },
      },
      {
        $group: {
          _id: "$user.userName",
          totalAssigned: {
            $sum: {
              $cond: [
                { $eq: [{ $size: "$statusHistory" }, 0] }, // Check if statusHistory is empty
                1,
                0,
              ],
            },
          },
          totalDraft: {
            $sum: {
              $cond: [{ $eq: ["$lastStatus.status", "draft"] }, 1, 0],
            },
          },
          totalModified: {
            $sum: {
              $cond: [{ $eq: ["$lastStatus.status", "modified"] }, 1, 0],
            },
          },
          totalSubmitted: {
            $sum: {
              $cond: [{ $eq: ["$lastStatus.status", "submitted"] }, 1, 0],
            },
          },
          totalApproved: {
            $sum: {
              $cond: [{ $eq: ["$lastStatus.status", "approved"] }, 1, 0],
            },
          },
          totalStarted: {
            $sum: {
              $cond: [{ $eq: ["$lastStatus.status", "started"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          userName: "$_id",
          totalAssigned: 1,
          totalDraft: 1,
          totalModified: 1,
          totalSubmitted: 1,
          totalApproved: 1,
          totalStarted: 1,
        },
      },
      {
        $skip: (pageNumber - 1) * sizePerPage,
      },
      {
        $limit: sizePerPage,
      },
    ];

    // Fetch the aggregated audit counts
    const auditorCounts = await AuditManagement.aggregate(pipeline);

    // Fetch total auditor count for pagination
    const totalAuditors = await User.countDocuments({ role: "AUDITOR" });

    res.json({
      total: totalAuditors,
      currentPage: pageNumber,
      data: auditorCounts,
    });
  } catch (error) {
    console.error("Error fetching auditor audits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
