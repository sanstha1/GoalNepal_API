import { Router } from "express";
import { tournamentController } from "../controllers/tournament.controllers";
import { uploadBanner } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authorization.middlewares";

const router = Router();

router.get("/", tournamentController.getAllTournaments.bind(tournamentController));
router.get("/:id", tournamentController.getTournamentById.bind(tournamentController));

router.use(authorizedMiddleware);

router.post(
  "/",
  uploadBanner.single("bannerImage"),
  tournamentController.createTournament.bind(tournamentController)
);

router.get(
  "/user/my-tournaments",
  tournamentController.getMyTournaments.bind(tournamentController)
);

router.put(
  "/:id",
  uploadBanner.single("bannerImage"),
  tournamentController.updateTournament.bind(tournamentController)
);

router.delete(
  "/:id",
  tournamentController.deleteTournament.bind(tournamentController)
);

export default router;