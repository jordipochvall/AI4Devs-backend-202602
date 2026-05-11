import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import candidateRoutes from './routes/candidateRoutes';
import { createPositionRoutes } from './routes/positionRoutes';
import { uploadFile } from './application/services/fileUploadService';
import { PrismaApplicationRepository } from './infrastructure/repositories/PrismaApplicationRepository';
import { PrismaPositionRepository } from './infrastructure/repositories/PrismaPositionRepository';
import { PositionService } from './application/services/PositionService';
import { PositionController } from './presentation/controllers/positionController';

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

  const positionService = new PositionService(positionRepo, applicationRepo);

  const positionController = new PositionController(positionService);

  // Routes
  app.use('/candidates', candidateRoutes);
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
