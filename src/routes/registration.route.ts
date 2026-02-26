import { Router } from "express";
import { registrationController } from "../controllers/registration.controllers";
import { authorizedMiddleware } from "../middlewares/authorization.middlewares";

const router = Router();

router.use(authorizedMiddleware);

router.post(
  "/",
  registrationController.registerForTournament.bind(registrationController)
);

router.get(
  "/my",
  registrationController.getMyRegistrations.bind(registrationController)
);

router.get(
  "/tournament/:tournamentId",
  registrationController.getTournamentRegistrations.bind(registrationController)
);

export default router;