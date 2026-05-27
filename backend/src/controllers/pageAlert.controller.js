const {
  getPageAlerts,
  resolvePageAlert,
  resolveInfoAlerts,
  resolveNotificationsAlerts,
  resolveMessageAlert,
} = require("../services/pageAlert.service");

const getMyPageAlerts = async (req, res) => {
  try {
    const alerts = await getPageAlerts(req.user.id);

    return res.status(200).json(alerts);
  } catch (error) {
    console.error("GET /page-alerts error:", error);

    return res.status(500).json({
      message: "Erreur lors du chargement des alertes.",
    });
  }
};

const resolveMyPageAlert = async (req, res) => {
  try {
    const { pageKey, refId, mode } = req.body;

    if (!pageKey) {
      return res.status(400).json({
        message: "pageKey is required",
      });
    }

    let result;

    if (pageKey === "notifications") {
      result = await resolveNotificationsAlerts(req.user.id);
    } else if (pageKey === "messages" && refId) {
      result = await resolveMessageAlert({
        userId: req.user.id,
        conversationId: refId,
      });
    } else if (mode === "INFO_ONLY") {
      result = await resolveInfoAlerts({
        userId: req.user.id,
        pageKey,
      });
    } else {
      result = await resolvePageAlert({
        userId: req.user.id,
        pageKey,
        refId,
      });
    }

    return res.status(200).json({
      message: "Alerte résolue.",
      count: result.count,
    });
  } catch (error) {
    console.error("PATCH /page-alerts/resolve error:", error);

    return res.status(500).json({
      message: "Erreur lors de la résolution de l’alerte.",
    });
  }
};

module.exports = {
  getMyPageAlerts,
  resolveMyPageAlert,
};