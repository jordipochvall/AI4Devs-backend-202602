import { Request, Response } from 'express';
import { ApplicationService } from '../../application/services/ApplicationService';
import { ValidationError } from '../../application/errors';
import { handleError, parseIntegerParam } from '../httpErrors';

export class CandidateStageController {
  constructor(private readonly service: ApplicationService) {}

  updateStage = async (req: Request, res: Response): Promise<Response> => {
    try {
      const candidateId = parseIntegerParam(req.params.id, 'id');
      const { applicationId, newInterviewStepId } = req.body ?? {};

      if (typeof applicationId !== 'number' || typeof newInterviewStepId !== 'number') {
        throw new ValidationError(
          "Body must contain numeric fields 'applicationId' and 'newInterviewStepId'",
        );
      }

      const result = await this.service.updateCandidateStage(candidateId, {
        applicationId,
        newInterviewStepId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
