import { Router } from "express";
import { AdminController } from "../../controllers/admin/admin.controller";
import { authorizedMiddleware, isAdmin } from "../../middlewares/authorization.middlewares";
import { uploadProfilePicture } from "../../middlewares/upload.middleware";

const router = Router();
const adminController = new AdminController();

router.use(authorizedMiddleware);
router.use(isAdmin);

router.get("/", adminController.getAllUsers.bind(adminController));
router.get("/:userId", adminController.getUserById.bind(adminController));
router.post("/", uploadProfilePicture.single("profilePicture"), adminController.createUser.bind(adminController));
router.put("/:userId", uploadProfilePicture.single("profilePicture"), adminController.updateUser.bind(adminController));
router.delete("/:userId", adminController.deleteUser.bind(adminController));

export default router;