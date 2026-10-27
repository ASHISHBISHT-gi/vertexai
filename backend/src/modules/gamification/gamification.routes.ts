import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as game from "./gamification.service";

const router = Router();
router.get("/users/me/badges", authenticate, async (req, res) => res.json(await game.getBadges(req.user!.id)));
router.get("/users/me/streak", authenticate, async (req, res) => res.json(await game.getStreak(req.user!.id)));
export default router;
