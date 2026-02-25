import { Router } from "express";
import { AdminController } from "../../controllers/admin/admin.controller";
import { authorizedMiddleware, isAdmin } from "../../middlewares/authorization.middlewares";
import { uploadProfilePicture } from "../../middlewares/upload.middleware";

const router = Router();
const adminController = new AdminController();

router.post("/register", adminController.registerAdmin.bind(adminController));
router.post("/login", adminController.loginAdmin.bind(adminController));

router.use(authorizedMiddleware);
router.use(isAdmin);

router.get("/profile", adminController.getAdminProfile.bind(adminController));
router.put("/profile", adminController.updateAdminProfile.bind(adminController));
router.get("/admins", adminController.getAllAdmins.bind(adminController));
router.get("/admins/:adminId", adminController.getAdminById.bind(adminController));
router.delete("/admins/:adminId", adminController.deleteAdmin.bind(adminController));

export default router;