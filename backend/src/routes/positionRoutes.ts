import { Router } from 'express';
import { PositionController } from '../presentation/controllers/positionController';

export const createPositionRoutes = (controller: PositionController): Router => {
  const router = Router();
  router.get('/:id/candidates', controller.getCandidatesInProcess);
  return router;
};
