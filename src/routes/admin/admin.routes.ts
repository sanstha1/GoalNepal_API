import { Router } from "express";
import { AdminController } from "../../controllers/admin/admin.controller";
import { authorizedMiddleware, isAdmin } from "../../middlewares/authorization.middlewares";
import { uploadProfilePicture } from "../../middlewares/upload.middleware";

const router = Router();
const adminController = new AdminController();

// Public admin routes (no admin access required)
router.post("/register", adminController.registerAdmin.bind(adminController));
router.post("/login", adminController.loginAdmin.bind(adminController));

// Apply authentication and admin check to all routes below
router.use(authorizedMiddleware);
router.use(isAdmin);

// Admin profile and management routes
router.get("/profile", adminController.getAdminProfile.bind(adminController));
router.put("/profile", adminController.updateAdminProfile.bind(adminController));
router.get("/admins", adminController.getAllAdmins.bind(adminController));
router.get("/admins/:adminId", adminController.getAdminById.bind(adminController));
router.delete("/admins/:adminId", adminController.deleteAdmin.bind(adminController));

// User Management Routes (these will be /api/admin/users/)
router.get("/", adminController.getAllUsers.bind(adminController));
router.get("/:userId", adminController.getUserById.bind(adminController));
router.post("/", uploadProfilePicture.single('profilePicture'), adminController.createUser.bind(adminController));
router.put("/:userId", uploadProfilePicture.single('profilePicture'), adminController.updateUser.bind(adminController));
router.delete("/:userId", adminController.deleteUser.bind(adminController));

export default router;