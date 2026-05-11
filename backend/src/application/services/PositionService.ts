import { NotFoundError, ValidationError } from '../errors';
import { IApplicationRepository } from '../../domain/repositories/IApplicationRepository';
import { IPositionRepository } from '../../domain/repositories/IPositionRepository';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface CandidateInProcess {
  applicationId: number;
  candidateId: number;
  fullName: string;
  currentInterviewStep: { id: number; name: string };
  averageScore: number | null;
}

export interface CandidatesInProcessResult {
  positionId: number;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  candidates: CandidateInProcess[];
}

export const MAX_PAGE_SIZE = 100;

export class PositionService {
  constructor(
    private readonly positionRepo: IPositionRepository,
    private readonly applicationRepo: IApplicationRepository,
  ) {}

  async getCandidatesInProcess(
    positionId: number,
    pagination: PaginationParams,
  ): Promise<CandidatesInProcessResult> {
    this.validatePagination(pagination);

    const position = await this.positionRepo.findById(positionId);
    if (!position) {
      throw new NotFoundError('Position', positionId);
    }

    const { page, pageSize } = pagination;
    const offset = (page - 1) * pageSize;

    const [rows, total] = await Promise.all([
      this.applicationRepo.findByPositionPaginated(positionId, offset, pageSize),
      this.applicationRepo.countByPosition(positionId),
    ]);

    const candidates: CandidateInProcess[] = rows.map((r) => ({
      applicationId: r.id,
      candidateId: r.candidateId,
      fullName: `${r.candidate.firstName} ${r.candidate.lastName}`,
      currentInterviewStep: r.currentInterviewStep,
      averageScore: this.computeAverage(r.interviews.map((i) => i.score)),
    }));

    return {
      positionId,
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      candidates,
    };
  }

  private validatePagination({ page, pageSize }: PaginationParams): void {
    if (!Number.isInteger(page) || page < 1) {
      throw new ValidationError(`Invalid page '${page}': must be a positive integer`);
    }
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new ValidationError(
        `Invalid pageSize '${pageSize}': must be an integer between 1 and ${MAX_PAGE_SIZE}`,
      );
    }
  }

  private computeAverage(scores: (number | null)[]): number | null {
    const valid = scores.filter((s): s is number => s !== null && s !== undefined);
    if (valid.length === 0) return null;
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    return Math.round(avg * 100) / 100;
  }
}
