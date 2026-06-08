const EN_TITLES_BY_TYPE = {
  SUPERVISOR_REQUEST: "New supervisor request",
  SUPERVISOR_APPROVED: "Supervisor account approved",
  SUPERVISOR_REJECTED: "Supervisor account rejected",
  BINOME_REQUEST: "New team invitation",
  BINOME_ACCEPTED: "Team invitation accepted",
  BINOME_REJECTED: "Team invitation rejected",
  BINOME_REMOVED: "Team removed",
  MESSAGE: "New message",
  APPLICATION_RECEIVED: "New application",
  APPLICATION_INTERVIEW: "Interview scheduled",
  APPLICATION_ACCEPTED: "Application accepted",
  APPLICATION_AFFECTED: "Application accepted",
  APPLICATION_REJECTED: "Application rejected",
  AFFECTATION_CANCELLED: "Assignment canceled",
  AFFECTATION_REMOVED: "Assignment removed",
  ASSIGNMENT_COMPLETED: "Assignment completed",
  STUDENT_REPORTED: "New report",
  ACCOUNT_BANNED: "Account banned",
  ACCOUNT_UNBANNED: "Account reactivated",
};

const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();

const fold = (value) =>
  normalize(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'")
    .toLowerCase();

const getQuotedValue = (message) => {
  const match = normalize(message).match(/["“](.+?)["”]/);
  return match?.[1] || "";
};

const beforePhrase = (message, phrase) => {
  const index = fold(message).indexOf(phrase);
  if (index < 0) return "";
  return normalize(message).slice(0, index).trim();
};

const afterPhrase = (message, phrase) => {
  const folded = fold(message);
  const index = folded.indexOf(phrase);
  if (index < 0) return "";
  return normalize(message).slice(index + phrase.length).trim();
};

const translateKnownFrenchTerms = (message) =>
  normalize(message)
    .replace(/\bmemoire final\b/gi, "final report")
    .replace(/\bm\u00e9moire final\b/gi, "final report")
    .replace(/\brapport final\b/gi, "final report")
    .replace(/\bIng\u00e9nieur\b/g, "Engineer")
    .replace(/\bing\u00e9nieur\b/g, "engineer")
    .replace(/\b\u00c9t\u00e9\b/g, "Summer internship")
    .replace(/\b\u00e9t\u00e9\b/g, "summer internship")
    .replace(/\bEncadrants\b/g, "Supervisors")
    .replace(/\bencadrants\b/g, "supervisors")
    .replace(/\bEncadrant\b/g, "Supervisor")
    .replace(/\bencadrant\b/g, "supervisor")
    .replace(/\bStagiaires\b/g, "Interns")
    .replace(/\bstagiaires\b/g, "interns")
    .replace(/\bStagiaire\b/g, "Intern")
    .replace(/\bstagiaire\b/g, "intern")
    .replace(/\bAffectations\b/g, "Assignments")
    .replace(/\baffectations\b/g, "assignments")
    .replace(/\bAffectation\b/g, "Assignment")
    .replace(/\baffectation\b/g, "assignment")
    .replace(/\bCandidatures\b/g, "Applications")
    .replace(/\bcandidatures\b/g, "applications")
    .replace(/\bCandidature\b/g, "Application")
    .replace(/\bcandidature\b/g, "application")
    .replace(/\bBin\u00f4mes\b/g, "Teams")
    .replace(/\bbin\u00f4mes\b/g, "teams")
    .replace(/\bBin\u00f4me\b/g, "Team")
    .replace(/\bbin\u00f4me\b/g, "team")
    .replace(/\bSujets\b/g, "Subjects")
    .replace(/\bsujets\b/g, "subjects")
    .replace(/\bSujet\b/g, "Subject")
    .replace(/\bsujet\b/g, "subject")
    .replace(/\bRapports\b/g, "Reports")
    .replace(/\brapports\b/g, "reports")
    .replace(/\bRapport\b/g, "Report")
    .replace(/\brapport\b/g, "report");

const translateNotificationTitle = (notification) => {
  if (notification?.type && EN_TITLES_BY_TYPE[notification.type]) {
    return EN_TITLES_BY_TYPE[notification.type];
  }

  return translateKnownFrenchTerms(notification?.title || "Notification");
};

const translateNotificationMessage = (notification) => {
  const message = normalize(notification?.message);
  const folded = fold(message);
  const subject = getQuotedValue(message);

  switch (notification?.type) {
    case "SUPERVISOR_REQUEST": {
      const requester = beforePhrase(message, " a demande");
      return requester
        ? `${requester} requested supervisor access.`
        : "A supervisor access request was submitted.";
    }
    case "SUPERVISOR_APPROVED":
      return "Your supervisor account has been approved. You can now access the platform.";
    case "SUPERVISOR_REJECTED":
      return "Your supervisor account request has been rejected.";
    case "BINOME_REQUEST": {
      const sender = beforePhrase(message, " vous a envoye");
      return sender
        ? `${sender} sent you a team invitation.`
        : "You received a team invitation.";
    }
    case "BINOME_ACCEPTED": {
      const student = beforePhrase(message, " a accepte");
      return student
        ? `${student} accepted your team invitation.`
        : "Your team invitation was accepted.";
    }
    case "BINOME_REJECTED": {
      const student = beforePhrase(message, " a refuse");
      return student
        ? `${student} rejected your team invitation.`
        : "Your team invitation was rejected.";
    }
    case "BINOME_REMOVED":
      return folded.includes("conservee")
        ? "Your team was automatically removed because the other student was banned. Your assignment is preserved."
        : "Your team was automatically removed because the other student was banned.";
    case "MESSAGE": {
      const sender = beforePhrase(message, " vous a envoye");
      return sender ? `${sender} sent you a message.` : "You received a new message.";
    }
    case "APPLICATION_RECEIVED":
      return folded.includes("binome")
        ? `A new team application was received for "${subject}".`
        : `A new application was received for "${subject}".`;
    case "APPLICATION_INTERVIEW": {
      const details = [];
      const dateText = message
        .match(/date et heure\s*:\s*(.+?)(?:\.\s*lien\s*:|$)/i)?.[1]
        ?.replace(/\.$/, "");
      const linkText = message.match(/lien\s*:\s*(.+)$/i)?.[1];
      if (dateText) details.push(`Date and time: ${dateText}.`);
      if (linkText) details.push(`Link: ${linkText}`);
      return [`Your interview for "${subject}" has been scheduled.`, ...details].join(" ");
    }
    case "APPLICATION_ACCEPTED":
    case "APPLICATION_AFFECTED":
      return folded.includes("entretien")
        ? `Your application for "${subject}" was accepted for an interview.`
        : `Your application for "${subject}" was accepted.`;
    case "APPLICATION_REJECTED":
      return folded.includes("faculte")
        ? `Your application for "${subject}" was rejected because someone from your faculty is already working on this subject.`
        : `Your application for "${subject}" was rejected.`;
    case "AFFECTATION_CANCELLED": {
      const reason = afterPhrase(message, "raison :");
      return reason
        ? `Your assignment for "${subject}" was canceled. Reason: ${reason}`
        : `Your assignment for "${subject}" was canceled.`;
    }
    case "AFFECTATION_REMOVED": {
      const match = message.match(/^L['’]affectation de (.+?) au sujet ["“](.+?)["”]/i);
      const student = match?.[1];
      const removedSubject = match?.[2] || subject;
      return student
        ? `The assignment for ${student} on "${removedSubject}" was removed because the student was banned.`
        : "An assignment was removed because a student was banned.";
    }
    case "ACCOUNT_BANNED":
      return "Your account has been banned. You can no longer access the platform.";
    case "ACCOUNT_UNBANNED":
      return "Your account has been reactivated.";
    case "STUDENT_REPORTED": {
      const match = message.match(/^(.+?) a signal(?:e|\u00e9) (.+?)\.$/i);
      return match ? `${match[1]} reported ${match[2]}.` : "A student report was submitted.";
    }
    case "ASSIGNMENT_COMPLETED":
      return message;
    default:
      return translateKnownFrenchTerms(message);
  }
};

export const translateNotification = (notification, language) => {
  if (language !== "EN") return notification;

  return {
    ...notification,
    title: translateNotificationTitle(notification),
    message: translateNotificationMessage(notification),
  };
};
