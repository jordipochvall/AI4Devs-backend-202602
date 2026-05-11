import { Request, Response } from 'express';
import { PositionService } from '../../application/services/PositionService';
import { handleError, parseIntegerParam, parsePagination } from '../httpErrors';

export class PositionController {
  constructor(private readonly service: PositionService) {}

  getCandidatesInProcess = async (req: Request, res: Response): Promise<Response> => {
    try {
      const positionId = parseIntegerParam(req.params.id, 'id');
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await this.service.getCandidatesInProcess(positionId, pagination);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
