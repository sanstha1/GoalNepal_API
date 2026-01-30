const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploads");

const {
  uploadProfilePicture,
  getMyProfile,
  updateUser,
  getUserById,
} = require("../controllers/profile_controller");

router.get("/me", getMyProfile);

router.get("/:userId", getUserById);

router.post(
  "/upload-profile-picture/:userId",
  upload.single("profilePicture"),
  uploadProfilePicture
);

router.patch("/:userId", updateUser);

module.exports = router;