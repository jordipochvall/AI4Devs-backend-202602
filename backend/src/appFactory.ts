import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import candidateRoutes from './routes/candidateRoutes';
import { createPositionRoutes } from './routes/positionRoutes';
import { createCandidateStageRoutes } from './routes/candidateStageRoutes';
import { uploadFile } from './application/services/fileUploadService';
import { PrismaApplicationRepository } from './infrastructure/repositories/PrismaApplicationRepository';
import { PrismaPositionRepository } from './infrastructure/repositories/PrismaPositionRepository';
import { PrismaCandidateRepository } from './infrastructure/repositories/PrismaCandidateRepository';
import { PrismaInterviewStepRepository } from './infrastructure/repositories/PrismaInterviewStepRepository';
import { PositionService } from './application/services/PositionService';
import { ApplicationService } from './application/services/ApplicationService';
import { PositionController } from './presentation/controllers/positionController';
import { CandidateStageController } from './presentation/controllers/candidateStageController';

export const buildApp = (prisma: PrismaClient): Express => {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
  );

  // Composition Root — DI manual
  const applicationRepo = new PrismaApplicationRepository(prisma);
  const positionRepo = new PrismaPositionRepository(prisma);
  const candidateRepo = new PrismaCandidateRepository(prisma);
  const stepRepo = new PrismaInterviewStepRepository(prisma);

  const positionService = new PositionService(positionRepo, applicationRepo);
  const applicationService = new ApplicationService(candidateRepo, applicationRepo, stepRepo);

  const positionController = new PositionController(positionService);
  const candidateStageController = new CandidateStageController(applicationService);

  // Routes — el router legacy de /candidates (POST, GET /:id) convive con el factory de PUT /:id/stage
  app.use('/candidates', candidateRoutes);
  app.use('/candidates', createCandidateStageRoutes(candidateStageController));
  app.use('/positions', createPositionRoutes(positionController));
  app.post('/upload', uploadFile);

  app.get('/', (_req, res) => {
    res.send('Hola LTI!');
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500).send('Something broke!');
  });

  return app;
};
