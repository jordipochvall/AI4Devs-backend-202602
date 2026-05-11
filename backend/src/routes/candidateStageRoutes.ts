import { Router } from 'express';
import { CandidateStageController } from '../presentation/controllers/candidateStageController';

export const createCandidateStageRoutes = (controller: CandidateStageController): Router => {
  const router = Router();
  router.put('/:id/stage', controller.updateStage);
  return router;
};
