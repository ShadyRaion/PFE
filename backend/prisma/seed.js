/**
 * STB Interns - Development/Demo Reset + Seed Script
 *
 * DEVELOPMENT / DEMO USE ONLY.
 * This script deletes ALL data in the database and recreates a fresh
 * realistic dataset for local testing. Never run it in production.
 *
 * Usage:
 *   cd backend
 *   npm run seed
 *   # or: node prisma/seed.js
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const CV_UPLOAD_DIR = path.resolve(__dirname, "..", "uploads", "cvs");
const SUBJECT_UPLOAD_DIR = path.resolve(
  __dirname,
  "..",
  "uploads",
  "subjects",
  "seed"
);

// ---------------------------------------------------------------------------
// 1. Reset
// ---------------------------------------------------------------------------
async function resetDatabase() {
  console.log("Resetting database for development/demo data only.");

  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.incidentReport.deleteMany(),
    prisma.academicReport.deleteMany(),
    prisma.application.deleteMany(),
    prisma.recommendationScore.deleteMany(),
    prisma.binome.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.pageAlert.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.blacklist.deleteMany(),
    prisma.cV.deleteMany(),
    prisma.subjectDocument.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

function cleanUploadFolder(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    try {
      const stat = fs.statSync(full);
      if (stat.isFile()) fs.unlinkSync(full);
    } catch {
      // ignore
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Users
// ---------------------------------------------------------------------------
async function createUsers() {
  const adminPwd = await bcrypt.hash("Admin123456", 10);
  const supPwd = await bcrypt.hash("Supervisor123456", 10);
  const stuPwd = await bcrypt.hash("Student123456", 10);

  const admin = await prisma.user.create({
    data: {
      fullName: "Admin STB",
      email: "admin@stb.tn",
      password: adminPwd,
      role: "ADMIN",
    },
  });

  // 5 supervisors — one per education field
  const supIT = await prisma.user.create({
    data: {
      fullName: "Mohamed Trabelsi",
      email: "supervisor.it@stb.tn",
      password: supPwd,
      role: "COMPANY_SUPERVISOR",
      phone: "+216 71 000 101",
      supervisorStatus: "APPROVED",
      department: "Information Technology",
      rank: "Senior Supervisor",
      division: "Digital Transformation Division",
    },
  });
  const supFinance = await prisma.user.create({
    data: {
      fullName: "Amira Ben Salem",
      email: "supervisor.finance@stb.tn",
      password: supPwd,
      role: "COMPANY_SUPERVISOR",
      phone: "+216 71 000 102",
      supervisorStatus: "APPROVED",
      department: "Finance and Accounting",
      rank: "Department Manager",
      division: "Risk Management Division",
    },
  });
  const supData = await prisma.user.create({
    data: {
      fullName: "Nadia Kallel",
      email: "supervisor.data@stb.tn",
      password: supPwd,
      role: "COMPANY_SUPERVISOR",
      phone: "+216 71 000 103",
      supervisorStatus: "APPROVED",
      department: "Data Analysis and Business Intelligence",
      rank: "Project Manager",
      division: "Data and Business Intelligence Division",
    },
  });
  const supHR = await prisma.user.create({
    data: {
      fullName: "Karim Haddad",
      email: "supervisor.hr@stb.tn",
      password: supPwd,
      role: "COMPANY_SUPERVISOR",
      phone: "+216 71 000 104",
      supervisorStatus: "APPROVED",
      department: "Management and Human Resources",
      rank: "Project Manager",
      division: "Human Resources Division",
    },
  });
  const supMkt = await prisma.user.create({
    data: {
      fullName: "Sarra Jaziri",
      email: "supervisor.marketing@stb.tn",
      password: supPwd,
      role: "COMPANY_SUPERVISOR",
      phone: "+216 71 000 105",
      supervisorStatus: "APPROVED",
      department: "Marketing and Communication",
      rank: "Senior Supervisor",
      division: "Marketing and Communication Division",
    },
  });

  // 8 students covering all eligibility combinations
  const rayen = await prisma.user.create({
    data: {
      fullName: "Rayen Gaya",
      email: "student.it.engineer@stb.tn",
      password: stuPwd,
      role: "STUDENT",
      university: "ISAMM",
      specialty: "Software Engineering",
      educationField: "INFORMATION_TECHNOLOGY",
      phone: "+216 20 000 001",
      degreeLevel: "Ingénieur",
      academicYear: "FINAL_YEAR",
      internshipType: "PFE",
      internshipStartDate: new Date("2026-02-01"),
      desiredDuration: "6 months",
    },
  });
  const lina = await prisma.user.create({
    data: {
      fullName: "Lina Mansouri",
      email: "student.finance.master@stb.tn",
      password: stuPwd,
      role: "STUDENT",
      university: "IHEC Carthage",
      specialty: "Finance and Accounting",
      educationField: "FINANCE_ACCOUNTING",
      phone: "+216 20 000 002",
      degreeLevel: "Master",
      academicYear: "FINAL_YEAR",
      internshipType: "PFE",
      internshipStartDate: new Date("2026-02-15"),
      desiredDuration: "6 months",
    },
  });
  const youssef = await prisma.user.create({
    data: {
      fullName: "Youssef Ben Ali",
      email: "student.marketing.licence@stb.tn",
      password: stuPwd,
      role: "STUDENT",
      university: "ESSECT",
      specialty: "Marketing and Communication",
      educationField: "MARKETING_COMMUNICATION",
      phone: "+216 20 000 003",
      degreeLevel: "Licence",
      academicYear: "SECOND_YEAR",
      internshipType: "Été",
      internshipStartDate: new Date("2026-07-01"),
      desiredDuration: "2 months",
    },
  });
  const salma = await prisma.user.create({
    data: {
      fullName: "Salma Ferchichi",
      email: "student.it.team@stb.tn",
      password: stuPwd,
      role: "STUDENT",
      university: "ISAMM",
      specialty: "Software Engineering",
      educationField: "INFORMATION_TECHNOLOGY",
      phone: "+216 20 000 004",
      degreeLevel: "Ingénieur",
      academicYear: "FINAL_YEAR",
      internshipType: "PFE",
      internshipStartDate: new Date("2026-02-01"),
      desiredDuration: "6 months",
    },
  });
  const anis = await prisma.user.create({
    data: {
      fullName: "Anis Mejri",
      email: "student.data.licence@stb.tn",
      password: stuPwd,
      role: "STUDENT",
      university: "ISG Tunis",
      specialty: "Business Intelligence",
      educationField: "DATA_ANALYSIS_BI",
      phone: "+216 20 000 005",
      degreeLevel: "Licence",
      academicYear: "FINAL_YEAR",
      internshipType: "Été",
      internshipStartDate: new Date("2026-06-15"),
      desiredDuration: "3 months",
    },
  });
  const mariem = await prisma.user.create({
    data: {
      fullName: "Mariem Zribi",
      email: "student.hr.master@stb.tn",
      password: stuPwd,
      role: "STUDENT",
      university: "ISCAE",
      specialty: "Human Resources Management",
      educationField: "MANAGEMENT_HR",
      phone: "+216 20 000 006",
      degreeLevel: "Master",
      academicYear: "FIRST_YEAR",
      internshipType: "Été",
      internshipStartDate: new Date("2026-07-01"),
      desiredDuration: "2 months",
    },
  });
  const omar = await prisma.user.create({
    data: {
      fullName: "Omar Saidi",
      email: "student.finance.licence@stb.tn",
      password: stuPwd,
      role: "STUDENT",
      university: "FSEG Tunis",
      specialty: "Finance",
      educationField: "FINANCE_ACCOUNTING",
      phone: "+216 20 000 007",
      degreeLevel: "Licence",
      academicYear: "FIRST_YEAR",
      internshipType: "Immersion",
      internshipStartDate: new Date("2026-01-15"),
      desiredDuration: "1 month",
    },
  });
  const nour = await prisma.user.create({
    data: {
      fullName: "Nour Hamdi",
      email: "student.marketing.master@stb.tn",
      password: stuPwd,
      role: "STUDENT",
      university: "IHEC Carthage",
      specialty: "Marketing",
      educationField: "MARKETING_COMMUNICATION",
      phone: "+216 20 000 008",
      degreeLevel: "Master",
      academicYear: "FINAL_YEAR",
      internshipType: "PFE",
      internshipStartDate: new Date("2026-02-01"),
      desiredDuration: "6 months",
    },
  });

  return {
    admin,
    supervisors: { supIT, supFinance, supData, supHR, supMkt },
    students: { rayen, lina, youssef, salma, anis, mariem, omar, nour },
  };
}

// ---------------------------------------------------------------------------
// 3. Binome (Rayen + Salma)
// ---------------------------------------------------------------------------
async function createBinome(rayen, salma) {
  return prisma.binome.create({
    data: {
      student1Id: rayen.id,
      student2Id: salma.id,
      requestedById: rayen.id,
      status: "ACCEPTED",
    },
  });
}

// ---------------------------------------------------------------------------
// 4. Subjects — 5 per education field, 25 total
// ---------------------------------------------------------------------------
function buildSubjectsCatalog(s) {
  const { supIT, supFinance, supData, supHR, supMkt } = s;

  return [
    // ============ A. Information Technology (supIT) ============
    {
      title: "Secure API Testing Toolkit",
      educationField: "INFORMATION_TECHNOLOGY",
      department: "Information Technology",
      supervisorId: supIT.id,
      internshipType: "PFE",
      allowedDegreeLevels: ["Master", "Ingénieur"],
      allowedAcademicYears: ["FINAL_YEAR"],
      requiredSkills: [
        "JavaScript",
        "Node.js",
        "Express.js",
        "REST API",
        "JWT",
        "API Security",
        "Postman",
        "PostgreSQL",
        "Prisma",
      ],
      technologies: ["Node.js", "Express.js", "PostgreSQL", "Prisma", "Postman"],
      duration: "6 months",
      places: 2,
    },
    {
      title: "Digital Banking Web Portal Maintenance",
      educationField: "INFORMATION_TECHNOLOGY",
      department: "Information Technology",
      supervisorId: supIT.id,
      internshipType: "Été",
      allowedDegreeLevels: ["Licence", "Master", "Ingénieur"],
      allowedAcademicYears: ["SECOND_YEAR", "FINAL_YEAR"],
      requiredSkills: ["React", "JavaScript", "HTML", "CSS", "Git", "API integration"],
      technologies: ["React", "Tailwind CSS", "Git"],
      duration: "2 months",
      places: 2,
    },
    {
      title: "Internal Access Control Dashboard",
      educationField: "INFORMATION_TECHNOLOGY",
      department: "Information Technology",
      supervisorId: supIT.id,
      internshipType: "PFE",
      allowedDegreeLevels: ["Ingénieur"],
      allowedAcademicYears: ["FINAL_YEAR"],
      requiredSkills: ["React", "Node.js", "RBAC", "JWT", "PostgreSQL", "Prisma"],
      technologies: ["React", "Node.js", "PostgreSQL", "Prisma"],
      duration: "6 months",
      places: 1,
    },
    {
      title: "IT Department Immersion: Banking Operations Discovery",
      educationField: "INFORMATION_TECHNOLOGY",
      department: "Information Technology",
      supervisorId: supIT.id,
      internshipType: "Immersion",
      allowedDegreeLevels: ["Licence"],
      allowedAcademicYears: ["FIRST_YEAR"],
      requiredSkills: [
        "basic web knowledge",
        "communication",
        "observation",
        "documentation",
      ],
      technologies: ["Microsoft Office"],
      duration: "1 month",
      places: 3,
    },
    {
      title: "DevOps CI/CD Pipeline Automation",
      educationField: "INFORMATION_TECHNOLOGY",
      department: "Information Technology",
      supervisorId: supIT.id,
      internshipType: "PFE",
      allowedDegreeLevels: ["Master", "Ingénieur"],
      allowedAcademicYears: ["FINAL_YEAR"],
      requiredSkills: [
        "Git",
        "CI/CD",
        "Docker",
        "automation",
        "testing",
        "deployment basics",
      ],
      technologies: ["Docker", "GitLab CI", "Jenkins"],
      duration: "6 months",
      places: 1,
    },

    // ============ B. Finance and Accounting (supFinance) ============
    {
      title: "Credit Risk Analysis for SME Loans",
      educationField: "FINANCE_ACCOUNTING",
      department: "Finance and Accounting",
      supervisorId: supFinance.id,
      internshipType: "PFE",
      allowedDegreeLevels: ["Master"],
      allowedAcademicYears: ["FINAL_YEAR"],
      requiredSkills: [
        "Credit risk analysis",
        "Financial analysis",
        "Accounting",
        "SME loans",
        "Excel",
        "Financial statements",
        "Risk assessment",
        "Reporting",
      ],
      technologies: ["Excel", "Power BI", "SQL"],
      duration: "6 months",
      places: 2,
    },
    {
      title: "Financial Statement Analysis Dashboard",
      educationField: "FINANCE_ACCOUNTING",
      department: "Finance and Accounting",
      supervisorId: supFinance.id,
      internshipType: "Été",
      allowedDegreeLevels: ["Licence", "Master"],
      allowedAcademicYears: ["FIRST_YEAR", "FINAL_YEAR"],
      requiredSkills: [
        "Accounting",
        "Financial statements",
        "Excel",
        "Power BI",
        "Reporting",
      ],
      technologies: ["Excel", "Power BI"],
      duration: "2 months",
      places: 2,
    },
    {
      title: "Internal Accounting Process Optimization",
      educationField: "FINANCE_ACCOUNTING",
      department: "Finance and Accounting",
      supervisorId: supFinance.id,
      internshipType: "PFE",
      allowedDegreeLevels: ["Master"],
      allowedAcademicYears: ["FINAL_YEAR"],
      requiredSkills: [
        "Accounting",
        "Process analysis",
        "Internal control",
        "Excel",
        "Documentation",
      ],
      technologies: ["Excel", "SAP"],
      duration: "6 months",
      places: 1,
    },
    {
      title: "Banking Product Profitability Study",
      educationField: "FINANCE_ACCOUNTING",
      department: "Finance and Accounting",
      supervisorId: supFinance.id,
      internshipType: "Été",
      allowedDegreeLevels: ["Licence", "Master"],
      allowedAcademicYears: ["SECOND_YEAR", "FINAL_YEAR"],
      requiredSkills: [
        "Profitability analysis",
        "Finance",
        "Excel",
        "Reporting",
        "Market analysis",
      ],
      technologies: ["Excel", "Power BI"],
      duration: "3 months",
      places: 2,
    },
    {
      title: "Banking Operations Discovery",
      educationField: "FINANCE_ACCOUNTING",
      department: "Finance and Accounting",
      supervisorId: supFinance.id,
      internshipType: "Immersion",
      allowedDegreeLevels: ["Licence"],
      allowedAcademicYears: ["FIRST_YEAR"],
      requiredSkills: [
        "Banking operations",
        "Accounting basics",
        "Customer service",
        "Financial products",
        "Excel",
        "Communication",
      ],
      technologies: ["Excel"],
      duration: "1 month",
      places: 3,
    },

    // ============ C. Data Analysis and BI (supData) ============
    {
      title: "Data Warehouse ETL Quality Monitor",
      educationField: "DATA_ANALYSIS_BI",
      department: "Data Analysis and Business Intelligence",
      supervisorId: supData.id,
      internshipType: "PFE",
      allowedDegreeLevels: ["Master", "Ingénieur"],
      allowedAcademicYears: ["FINAL_YEAR"],
      requiredSkills: ["SQL", "ETL", "data warehouse", "data quality", "Python", "reporting"],
      technologies: ["Python", "SQL", "Airflow"],
      duration: "6 months",
      places: 1,
    },
    {
      title: "Customer Segmentation Dashboard",
      educationField: "DATA_ANALYSIS_BI",
      department: "Data Analysis and Business Intelligence",
      supervisorId: supData.id,
      internshipType: "PFE",
      allowedDegreeLevels: ["Master"],
      allowedAcademicYears: ["FINAL_YEAR"],
      requiredSkills: [
        "customer segmentation",
        "data analysis",
        "Power BI",
        "SQL",
        "Python",
        "statistics",
      ],
      technologies: ["Power BI", "Python", "SQL"],
      duration: "6 months",
      places: 2,
    },
    {
      title: "Banking KPI Reporting System",
      educationField: "DATA_ANALYSIS_BI",
      department: "Data Analysis and Business Intelligence",
      supervisorId: supData.id,
      internshipType: "Été",
      allowedDegreeLevels: ["Licence", "Master"],
      allowedAcademicYears: ["FIRST_YEAR", "FINAL_YEAR"],
      requiredSkills: [
        "Power BI",
        "SQL",
        "data analysis",
        "dashboarding",
        "Excel",
        "reporting",
        "banking KPIs",
      ],
      technologies: ["Power BI", "SQL", "Excel"],
      duration: "3 months",
      places: 2,
    },
    {
      title: "Transaction Data Quality Analysis",
      educationField: "DATA_ANALYSIS_BI",
      department: "Data Analysis and Business Intelligence",
      supervisorId: supData.id,
      internshipType: "Été",
      allowedDegreeLevels: ["Licence", "Master"],
      allowedAcademicYears: ["SECOND_YEAR", "FINAL_YEAR"],
      requiredSkills: ["data quality", "SQL", "Excel", "analysis", "reporting"],
      technologies: ["SQL", "Excel", "Python"],
      duration: "2 months",
      places: 2,
    },
    {
      title: "Data Governance Discovery",
      educationField: "DATA_ANALYSIS_BI",
      department: "Data Analysis and Business Intelligence",
      supervisorId: supData.id,
      internshipType: "Immersion",
      allowedDegreeLevels: ["Licence"],
      allowedAcademicYears: ["FIRST_YEAR"],
      requiredSkills: ["data concepts", "documentation", "communication", "Excel"],
      technologies: ["Excel"],
      duration: "1 month",
      places: 2,
    },

    // ============ D. Management and HR (supHR) ============
    {
      title: "Internship Management Process Optimization",
      educationField: "MANAGEMENT_HR",
      department: "Management and Human Resources",
      supervisorId: supHR.id,
      internshipType: "PFE",
      allowedDegreeLevels: ["Master"],
      allowedAcademicYears: ["FINAL_YEAR"],
      requiredSkills: [
        "process optimization",
        "HR management",
        "workflow analysis",
        "communication",
        "reporting",
      ],
      technologies: ["BPMN", "Microsoft Office"],
      duration: "6 months",
      places: 1,
    },
    {
      title: "Employee Training Tracking Dashboard",
      educationField: "MANAGEMENT_HR",
      department: "Management and Human Resources",
      supervisorId: supHR.id,
      internshipType: "Été",
      allowedDegreeLevels: ["Licence", "Master"],
      allowedAcademicYears: ["FIRST_YEAR", "SECOND_YEAR"],
      requiredSkills: ["training management", "Excel", "dashboarding", "HR", "reporting"],
      technologies: ["Excel", "Power BI", "SharePoint"],
      duration: "2 months",
      places: 2,
    },
    {
      title: "HR Recruitment Workflow Digitalization",
      educationField: "MANAGEMENT_HR",
      department: "Management and Human Resources",
      supervisorId: supHR.id,
      internshipType: "Été",
      allowedDegreeLevels: ["Master"],
      allowedAcademicYears: ["FIRST_YEAR", "FINAL_YEAR"],
      requiredSkills: [
        "human resources",
        "recruitment",
        "process optimization",
        "workflow analysis",
        "Excel",
        "communication",
      ],
      technologies: ["Power Automate", "Microsoft Office"],
      duration: "3 months",
      places: 2,
    },
    {
      title: "Administrative Request Follow-up System",
      educationField: "MANAGEMENT_HR",
      department: "Management and Human Resources",
      supervisorId: supHR.id,
      internshipType: "PFE",
      allowedDegreeLevels: ["Master", "Ingénieur"],
      allowedAcademicYears: ["FINAL_YEAR"],
      requiredSkills: [
        "administrative management",
        "process analysis",
        "reporting",
        "communication",
        "digitalization",
      ],
      technologies: ["SharePoint", "Power Automate"],
      duration: "6 months",
      places: 1,
    },
    {
      title: "HR Department Immersion",
      educationField: "MANAGEMENT_HR",
      department: "Management and Human Resources",
      supervisorId: supHR.id,
      internshipType: "Immersion",
      allowedDegreeLevels: ["Licence"],
      allowedAcademicYears: ["FIRST_YEAR"],
      requiredSkills: ["communication", "observation", "documentation", "HR basics"],
      technologies: ["Microsoft Office"],
      duration: "1 month",
      places: 3,
    },

    // ============ E. Marketing and Communication (supMkt) ============
    {
      title: "Digital Campaign Performance Analysis",
      educationField: "MARKETING_COMMUNICATION",
      department: "Marketing and Communication",
      supervisorId: supMkt.id,
      internshipType: "Été",
      allowedDegreeLevels: ["Licence", "Master"],
      allowedAcademicYears: ["SECOND_YEAR", "FINAL_YEAR"],
      requiredSkills: [
        "Digital marketing",
        "Campaign analysis",
        "Google Analytics",
        "KPI tracking",
        "Excel",
        "Content planning",
      ],
      technologies: ["Google Analytics", "Power BI", "Meta Ads"],
      duration: "2 months",
      places: 2,
    },
    {
      title: "Customer Satisfaction Survey Dashboard",
      educationField: "MARKETING_COMMUNICATION",
      department: "Marketing and Communication",
      supervisorId: supMkt.id,
      internshipType: "Été",
      allowedDegreeLevels: ["Licence", "Master"],
      allowedAcademicYears: ["FIRST_YEAR", "SECOND_YEAR"],
      requiredSkills: [
        "customer satisfaction",
        "survey analysis",
        "Excel",
        "communication",
        "reporting",
      ],
      technologies: ["Microsoft Forms", "Power BI", "Excel"],
      duration: "2 months",
      places: 2,
    },
    {
      title: "Banking Product Communication Strategy",
      educationField: "MARKETING_COMMUNICATION",
      department: "Marketing and Communication",
      supervisorId: supMkt.id,
      internshipType: "PFE",
      allowedDegreeLevels: ["Master"],
      allowedAcademicYears: ["FINAL_YEAR"],
      requiredSkills: [
        "marketing strategy",
        "communication plan",
        "market study",
        "customer segmentation",
        "content writing",
        "banking products",
      ],
      technologies: ["Microsoft Office", "Canva"],
      duration: "6 months",
      places: 1,
    },
    {
      title: "Social Media Content Planning for Banking Services",
      educationField: "MARKETING_COMMUNICATION",
      department: "Marketing and Communication",
      supervisorId: supMkt.id,
      internshipType: "Été",
      allowedDegreeLevels: ["Licence"],
      allowedAcademicYears: ["SECOND_YEAR", "FINAL_YEAR"],
      requiredSkills: [
        "social media strategy",
        "content planning",
        "copywriting",
        "communication",
        "Canva",
      ],
      technologies: ["Canva", "Meta Ads"],
      duration: "2 months",
      places: 2,
    },
    {
      title: "Marketing Department Immersion",
      educationField: "MARKETING_COMMUNICATION",
      department: "Marketing and Communication",
      supervisorId: supMkt.id,
      internshipType: "Immersion",
      allowedDegreeLevels: ["Licence"],
      allowedAcademicYears: ["FIRST_YEAR"],
      requiredSkills: [
        "communication",
        "observation",
        "documentation",
        "marketing basics",
      ],
      technologies: ["Microsoft Office"],
      duration: "1 month",
      places: 3,
    },
  ];
}

function buildDescription(subject) {
  const lines = [
    `Internship subject offered by STB - ${subject.department}.`,
    "",
    "Objectives:",
    "- Deliver a working solution validated by the supervisor.",
    "- Document the methodology and final deliverables.",
    "- Present the results at the final defence.",
    "",
    "Missions:",
    "- Analyse the current situation and define requirements.",
    "- Implement the proposed solution iteratively.",
    "- Validate the deliverables with stakeholders.",
    "",
    "Expected deliverables:",
    "- Functional prototype or analytical study.",
    "- Technical documentation and user guide.",
    "- Final report and defence presentation.",
    "",
    "Prerequisites:",
    `- Background in ${subject.department}.`,
    "- Strong communication and analytical skills.",
  ];
  return lines.join("\n");
}

async function createSubjects(catalog) {
  const created = [];
  for (const subject of catalog) {
    const row = await prisma.subject.create({
      data: {
        title: subject.title,
        description: buildDescription(subject),
        technologies: [],
        requiredSkills: subject.requiredSkills,
        duration: subject.duration,
        places: subject.places,
        department: subject.department,
        educationField: subject.educationField,
        supervisorId: subject.supervisorId,
        internshipType: subject.internshipType,
        allowedDegreeLevels: subject.allowedDegreeLevels || [],
        allowedAcademicYears: subject.allowedAcademicYears || [],
      },
    });
    created.push(row);
  }
  return created;
}

// ---------------------------------------------------------------------------
// 5. Resumes
// ---------------------------------------------------------------------------
function buildResume({
  student,
  summary,
  technicalSkills,
  tools,
  domainSkills,
  languages,
  certifications,
  softSkills,
}) {
  const allSkills = [
    ...technicalSkills,
    ...tools,
    ...domainSkills,
    ...softSkills,
  ];

  const rawTextLines = [
    student.fullName.toUpperCase(),
    student.email,
    student.phone || "",
    "",
    "PROFILE",
    summary,
    "",
    "EDUCATION",
    `${student.university} - ${student.specialty}`,
    "",
    "TECHNICAL SKILLS",
    technicalSkills.join(", "),
    "",
    "TOOLS",
    tools.join(", "),
    "",
    "DOMAIN EXPERTISE",
    domainSkills.join(", "),
    "",
    "SOFT SKILLS",
    softSkills.join(", "),
    "",
    "CERTIFICATIONS",
    certifications.join(", "),
    "",
    "LANGUAGES",
    languages
      .map((lang) =>
        typeof lang === "string"
          ? lang
          : `${lang.language} (${lang.level || ""})`
      )
      .join(", "),
  ];

  return {
    rawText: rawTextLines.join("\n"),
    extractedSkills: allSkills,
    extractedData: {
      technicalSkills,
      softSkills,
      languages,
      tools,
      domainSkills,
      certifications,
      allSkills,
      detectedLanguage: "en",
    },
  };
}

async function createResume({ student, profile }) {
  const built = buildResume({ student, ...profile });

  const slug = student.fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const fileName = `${Date.now()}-${slug}-resume.txt`;
  const filePath = path.join(CV_UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, built.rawText, "utf8");

  return prisma.cV.create({
    data: {
      userId: student.id,
      originalName: `${student.fullName} - Resume.txt`,
      fileName,
      filePath,
      fileType: "text/plain",
      fileSize: Buffer.byteLength(built.rawText, "utf8"),
      extractedSkills: built.extractedSkills,
      extractedData: built.extractedData,
      rawText: built.rawText,
    },
  });
}

async function createAllResumes(students) {
  const { rayen, lina, youssef, salma, anis, mariem, omar, nour } = students;

  await createResume({
    student: rayen,
    profile: {
      summary:
        "Final-year software engineering student passionate about secure backend development, REST APIs, and automated testing.",
      technicalSkills: [
        "JavaScript",
        "Node.js",
        "Express.js",
        "REST API",
        "JWT",
        "API Security",
        "React",
        "Testing",
      ],
      tools: ["Postman", "PostgreSQL", "Prisma", "Git"],
      domainSkills: ["Banking", "Web Security"],
      softSkills: ["Communication", "Teamwork", "Problem solving"],
      certifications: ["Postman API Fundamentals"],
      languages: [
        { language: "English", level: "B2" },
        { language: "French", level: "Fluent" },
        { language: "Arabic", level: "Native" },
      ],
    },
  });

  await createResume({
    student: lina,
    profile: {
      summary:
        "Finance and accounting student focused on credit risk, SME lending and banking financial analysis.",
      technicalSkills: [
        "Credit risk analysis",
        "Financial analysis",
        "Accounting",
        "SME loans",
        "Banking operations",
        "Financial statements",
        "Risk assessment",
        "Reporting",
      ],
      tools: ["Excel", "Power BI"],
      domainSkills: ["Banking", "SME lending"],
      softSkills: ["Analytical thinking", "Rigour", "Communication"],
      certifications: ["Bloomberg Market Concepts"],
      languages: [
        { language: "French", level: "Native" },
        { language: "English", level: "B2" },
        { language: "Arabic", level: "Native" },
      ],
    },
  });

  await createResume({
    student: youssef,
    profile: {
      summary:
        "Marketing and communication student specialised in digital campaign performance and customer engagement.",
      technicalSkills: [
        "Digital marketing",
        "Campaign analysis",
        "Customer communication",
        "Social media strategy",
        "Market research",
        "KPI tracking",
        "Content planning",
        "Banking products communication",
      ],
      tools: ["Google Analytics", "Excel", "Meta Ads", "Canva"],
      domainSkills: ["Banking", "Customer experience"],
      softSkills: ["Creativity", "Communication", "Teamwork"],
      certifications: ["Google Analytics Certified", "Meta Blueprint"],
      languages: [
        { language: "French", level: "Fluent" },
        { language: "English", level: "B1" },
        { language: "Arabic", level: "Native" },
      ],
    },
  });

  await createResume({
    student: salma,
    profile: {
      summary:
        "Software engineering student focused on React, UI/UX and API integration. Comfortable with Node.js/Express backends and JWT auth from team projects.",
      technicalSkills: [
        "React",
        "JavaScript",
        "Tailwind CSS",
        "UI/UX",
        "Frontend testing",
        "API integration",
        "Node.js",
        "Express.js",
        "REST API",
        "JWT",
        "PostgreSQL",
      ],
      tools: ["Git", "Figma", "Postman", "Prisma"],
      domainSkills: ["Web Development", "Web Security"],
      softSkills: ["Attention to detail", "Communication", "Teamwork"],
      certifications: [],
      languages: [
        { language: "English", level: "B2" },
        { language: "French", level: "Fluent" },
        { language: "Arabic", level: "Native" },
      ],
    },
  });

  await createResume({
    student: anis,
    profile: {
      summary:
        "Final-year licence student in BI focused on dashboards, SQL and banking KPI reporting.",
      technicalSkills: [
        "Power BI",
        "SQL",
        "data analysis",
        "dashboarding",
        "reporting",
        "ETL basics",
        "data quality",
        "banking KPIs",
        "Python",
      ],
      tools: ["Excel", "Power BI", "SQL"],
      domainSkills: ["Banking", "Business Intelligence"],
      softSkills: ["Analytical thinking", "Communication", "Curiosity"],
      certifications: ["Microsoft Power BI Data Analyst (PL-300)"],
      languages: [
        { language: "French", level: "Fluent" },
        { language: "English", level: "B2" },
        { language: "Arabic", level: "Native" },
      ],
    },
  });

  await createResume({
    student: mariem,
    profile: {
      summary:
        "Master student in HR focused on recruitment workflows, training tracking and process optimization.",
      technicalSkills: [
        "human resources",
        "recruitment",
        "process optimization",
        "training tracking",
        "communication",
        "administrative management",
        "workflow analysis",
      ],
      tools: ["Excel", "Microsoft Office"],
      domainSkills: ["HR", "Banking"],
      softSkills: ["Communication", "Organisation", "Empathy"],
      certifications: [],
      languages: [
        { language: "French", level: "Native" },
        { language: "English", level: "B1" },
        { language: "Arabic", level: "Native" },
      ],
    },
  });

  await createResume({
    student: omar,
    profile: {
      summary:
        "First-year finance student curious about banking operations, customer service and financial products.",
      technicalSkills: [
        "Banking operations",
        "Accounting basics",
        "Customer service",
        "Financial products",
        "Communication",
      ],
      tools: ["Excel"],
      domainSkills: ["Banking"],
      softSkills: ["Curiosity", "Communication", "Rigour"],
      certifications: [],
      languages: [
        { language: "French", level: "Native" },
        { language: "English", level: "A2" },
        { language: "Arabic", level: "Native" },
      ],
    },
  });

  await createResume({
    student: nour,
    profile: {
      summary:
        "Master student in marketing focused on banking product communication, market study and campaign planning.",
      technicalSkills: [
        "marketing strategy",
        "communication plan",
        "market study",
        "customer segmentation",
        "content writing",
        "banking products",
        "campaign planning",
      ],
      tools: ["Excel", "Google Analytics", "Canva"],
      domainSkills: ["Banking", "Marketing"],
      softSkills: ["Creativity", "Communication", "Strategic thinking"],
      certifications: ["Google Analytics Certified"],
      languages: [
        { language: "French", level: "Fluent" },
        { language: "English", level: "B2" },
        { language: "Arabic", level: "Native" },
      ],
    },
  });
}

// ---------------------------------------------------------------------------
// 6. Recommendation scores
// ---------------------------------------------------------------------------
async function recalculateAll(students) {
  const { recalculateScoresForStudent } = require("../src/services/recommendation.service");

  for (const student of Object.values(students)) {
    try {
      await recalculateScoresForStudent(student.id);
      console.log(`  scored: ${student.email}`);
    } catch (error) {
      console.error(`  scoring failed for ${student.email}:`, error.message);
    }
  }
}

// ---------------------------------------------------------------------------
// 7. Optional sample applications (PENDING)
// ---------------------------------------------------------------------------
async function createSampleApplications({ students, subjects, binome }) {
  const byTitle = Object.fromEntries(subjects.map((s) => [s.title, s]));
  const samples = [
    {
      title: "Secure API Testing Toolkit",
      binomeId: binome?.id,
      studentId: null,
    },
    {
      title: "Credit Risk Analysis for SME Loans",
      binomeId: null,
      studentId: students.lina.id,
    },
    {
      title: "Digital Campaign Performance Analysis",
      binomeId: null,
      studentId: students.youssef.id,
    },
  ];

  const created = [];
  for (const { title, binomeId, studentId } of samples) {
    const subject = byTitle[title];
    if (!subject) continue;
    const app = await prisma.application.create({
      data: {
        subjectId: subject.id,
        studentId,
        binomeId,
        status: "PENDING",
      },
    });
    created.push(app);
  }
  return created;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("============================================================");
  console.log(" STB Interns - Development/Demo seed");
  console.log(" WARNING: This deletes ALL data and reseeds the database.");
  console.log("============================================================");

  await resetDatabase();
  cleanUploadFolder(CV_UPLOAD_DIR);
  cleanUploadFolder(SUBJECT_UPLOAD_DIR);

  console.log("Creating users...");
  const { admin, supervisors, students } = await createUsers();

  console.log("Creating accepted team (Rayen + Salma)...");
  const binome = await createBinome(students.rayen, students.salma);

  console.log("Creating subjects...");
  const catalog = buildSubjectsCatalog(supervisors);
  const subjects = await createSubjects(catalog);

  console.log("Creating resumes...");
  await createAllResumes(students);

  console.log("Computing recommendation scores...");
  await recalculateAll(students);

  console.log("Creating sample applications...");
  const applications = await createSampleApplications({ students, subjects, binome });

  const scoreCount = await prisma.recommendationScore.count();

  console.log("");
  console.log("============================================================");
  console.log(" Seed completed successfully");
  console.log("============================================================");
  console.log(` Admin:                 1`);
  console.log(` Supervisors:           5`);
  console.log(` Students:              8`);
  console.log(` Teams (binome):        1 (ACCEPTED)`);
  console.log(` Subjects:              ${subjects.length}`);
  console.log(` Resumes:               8`);
  console.log(` Recommendation scores: ${scoreCount}`);
  console.log(` Applications:          ${applications.length} (PENDING)`);
  console.log("");
  console.log(" Demo credentials");
  console.log(" --------------------------------");
  console.log(" Admin:");
  console.log("   admin@stb.tn / Admin123456");
  console.log(" Supervisors (password: Supervisor123456):");
  console.log("   supervisor.it@stb.tn         (Mohamed Trabelsi - IT)");
  console.log("   supervisor.finance@stb.tn    (Amira Ben Salem - Finance)");
  console.log("   supervisor.data@stb.tn       (Nadia Kallel - Data/BI)");
  console.log("   supervisor.hr@stb.tn         (Karim Haddad - HR)");
  console.log("   supervisor.marketing@stb.tn  (Sarra Jaziri - Marketing)");
  console.log(" Students (password: Student123456):");
  console.log("   student.it.engineer@stb.tn        (Rayen Gaya - Ingénieur/Final/PFE/IT)");
  console.log("   student.finance.master@stb.tn     (Lina Mansouri - Master/Final/PFE/Finance)");
  console.log("   student.marketing.licence@stb.tn  (Youssef Ben Ali - Licence/2nd/Été/Marketing)");
  console.log("   student.it.team@stb.tn            (Salma Ferchichi - Ingénieur/Final/PFE/IT, team with Rayen)");
  console.log("   student.data.licence@stb.tn       (Anis Mejri - Licence/Final/Été/Data)");
  console.log("   student.hr.master@stb.tn          (Mariem Zribi - Master/1st/Été/HR)");
  console.log("   student.finance.licence@stb.tn    (Omar Saidi - Licence/1st/Immersion/Finance)");
  console.log("   student.marketing.master@stb.tn   (Nour Hamdi - Master/Final/PFE/Marketing)");
  console.log("============================================================");

  void admin;
  void binome;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
