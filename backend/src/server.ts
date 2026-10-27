import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { pool } from "./db/pool";
import { errorHandler, notFoundHandler } from "./middleware/error";
import authRoutes from "./modules/auth/auth.routes";
import courseRoutes from "./modules/courses/courses.routes";
import adminRoutes from "./modules/admin/admin.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import resourceRoutes from "./modules/resources/resources.routes";
import reviewRoutes from "./modules/reviews/reviews.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import assignmentRoutes from "./modules/assignments/assignments.routes";
import certificateRoutes from "./modules/certificates/certificates.routes";
import enrollmentRoutes from "./modules/enrollments/enrollments.routes";
import gamificationRoutes from "./modules/gamification/gamification.routes";
import learningRoutes from "./modules/learning/learning.routes";
import recommendationRoutes from "./modules/recommendations/recommendations.routes";
import quizRoutes from "./modules/quizzes/quizzes.routes";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()) }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT now() AS db_time");
    res.json({ status: "ok", db_time: rows[0].db_time });
  } catch {
    res.status(503).json({ status: "error", message: "database unreachable" });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", courseRoutes);
app.use("/api/v1", enrollmentRoutes);
app.use("/api/v1", learningRoutes);
app.use("/api/v1", assignmentRoutes);
app.use("/api/v1", quizRoutes);
app.use("/api/v1", certificateRoutes);
app.use("/api/v1", gamificationRoutes);
app.use("/api/v1", analyticsRoutes);
app.use("/api/v1", recommendationRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1", resourceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});
