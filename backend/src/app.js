const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const cvRoutes = require("./routes/cv.routes");
const subjectRoutes = require("./routes/subject.routes");
const applicationRoutes = require("./routes/application.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const supervisorRoutes = require("./routes/supervisor.routes");
const supervisorsRoutes = require("./routes/supervisors.routes");
const supervisorDashboardRoutes = require("./routes/supervisorDashboard.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const messageRoutes = require("./routes/message.routes");
const binomeRoutes = require("./routes/binome.routes");
const exportRoutes = require("./routes/export.routes");
const pageAlertRoutes = require("./routes/pageAlert.routes");
const settingsRoutes = require("./routes/settings.routes");
const subjectDocumentRoutes = require("./routes/subjectDocument.routes");
const academicReportRoutes = require("./routes/academicReport.routes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "STB Interns API running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/recommendations", recommendationRoutes);

app.use("/api/supervisor", supervisorRoutes);
app.use("/api/supervisors", supervisorsRoutes);
app.use("/api/supervisor-dashboard", supervisorDashboardRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/binome", binomeRoutes);
app.use("/api/exports", exportRoutes);
app.use("/api/page-alerts", pageAlertRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/subject-documents", subjectDocumentRoutes);
app.use("/api/academic-report", academicReportRoutes);

module.exports = app;
