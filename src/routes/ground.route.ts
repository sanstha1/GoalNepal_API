import { Router } from "express";
import { getNearbyGrounds, getAllGrounds, createGround } from "../controllers/grounds.controllers";
import { asyncHandler } from "../errors/errorhandler";

const router = Router();

router.get("/nearby", asyncHandler(getNearbyGrounds));
router.get("/", asyncHandler(getAllGrounds));
router.post("/", asyncHandler(createGround));

export default router;