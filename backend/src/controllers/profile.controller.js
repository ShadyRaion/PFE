const prisma = require("../config/prisma");
const { createAuditLog } = require("../services/audit.service");
const { isEducationField } = require("../utils/educationField");
const {
  validateStudentProfileFields,
  validateSupervisorProfileFields,
} = require("../utils/profileFields");

const sanitizeUser = (user) => {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
};

const getMyProfile = async (req, res) => {
  try {
    res.status(200).json(sanitizeUser(req.user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { fullName, phone, university, specialty, educationField } = req.body;

    const data = {
      fullName: fullName ?? req.user.fullName,
      phone: phone ?? req.user.phone,
      university: university ?? req.user.university,
      specialty: specialty ?? req.user.specialty,
    };

    if (educationField !== undefined) {
      if (req.user.role !== "STUDENT") {
        return res.status(403).json({
          message: "Only students can set an education field.",
        });
      }

      if (!isEducationField(educationField)) {
        return res.status(400).json({
          message: "Please choose a valid education field.",
        });
      }

      data.educationField = educationField;
    }

    if (req.user.role === "STUDENT") {
      const studentInput = {};
      if (req.body.degreeLevel !== undefined)
        studentInput.degreeLevel = req.body.degreeLevel;
      if (req.body.academicYear !== undefined)
        studentInput.academicYear = req.body.academicYear;
      if (req.body.internshipType !== undefined)
        studentInput.internshipType = req.body.internshipType;
      if (req.body.internshipStartDate !== undefined)
        studentInput.internshipStartDate = req.body.internshipStartDate;
      if (req.body.desiredDuration !== undefined)
        studentInput.desiredDuration = req.body.desiredDuration;

      if (Object.keys(studentInput).length > 0) {
        if (
          studentInput.academicYear !== undefined &&
          studentInput.degreeLevel === undefined &&
          req.user.degreeLevel
        ) {
          studentInput.degreeLevel = req.user.degreeLevel;
        }
        if (
          studentInput.internshipType !== undefined &&
          studentInput.academicYear === undefined &&
          req.user.academicYear
        ) {
          studentInput.academicYear = req.user.academicYear;
        }
        if (
          studentInput.academicYear !== undefined &&
          studentInput.internshipType === undefined &&
          req.user.internshipType
        ) {
          studentInput.internshipType = req.user.internshipType;
        }
        const result = validateStudentProfileFields(studentInput);
        if (result.errors.length) {
          return res.status(400).json({ message: result.errors[0] });
        }
        Object.assign(data, result.data);
      }
    }

    if (req.user.role === "COMPANY_SUPERVISOR") {
      const supervisorInput = {};
      if (req.body.department !== undefined)
        supervisorInput.department = req.body.department;
      if (req.body.rank !== undefined) supervisorInput.rank = req.body.rank;
      if (req.body.division !== undefined)
        supervisorInput.division = req.body.division;

      if (Object.keys(supervisorInput).length > 0) {
        const result = validateSupervisorProfileFields(supervisorInput);
        if (result.errors.length) {
          return res.status(400).json({ message: result.errors[0] });
        }
        Object.assign(data, result.data);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "PROFILE_UPDATE",
      entity: "USER",
      entityId: req.user.id,
      details: {
        changedFields: [
          "fullName",
          "phone",
          "university",
          "specialty",
          "educationField",
          "degreeLevel",
          "academicYear",
          "internshipType",
          "internshipStartDate",
          "desiredDuration",
          "department",
          "rank",
          "division",
        ].filter(
          (field) =>
            req.body[field] !== undefined && req.body[field] !== req.user[field]
        ),
      },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};
