import { Router } from "express";
import { uploadProfilePicture, getMyProfile, updateUser, getUserById } from "../controllers/profile_controller";
import { uploadProfilePicture as upload } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authorization.middlewares";

const router = Router();

router.get("/me", authorizedMiddleware, getMyProfile);
router.get("/:userId", authorizedMiddleware, getUserById);
router.post(
  "/upload-profile-picture/:userId",
  authorizedMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.patch("/:userId", authorizedMiddleware, updateUser);

export default router;
