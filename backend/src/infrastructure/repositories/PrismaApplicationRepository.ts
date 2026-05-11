import { PrismaClient } from '@prisma/client';
import {
  ApplicationForStageUpdate,
  ApplicationListItem,
  IApplicationRepository,
} from '../../domain/repositories/IApplicationRepository';

export class PrismaApplicationRepository implements IApplicationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPositionPaginated(
    positionId: number,
    offset: number,
    limit: number,
  ): Promise<ApplicationListItem[]> {
    const rows = await this.prisma.application.findMany({
      where: { positionId },
      orderBy: [{ applicationDate: 'desc' }, { id: 'asc' }],
      skip: offset,
      take: limit,
      select: {
        id: true,
        candidateId: true,
        positionId: true,
        applicationDate: true,
        candidate: { select: { id: true, firstName: true, lastName: true } },
        interviewStep: { select: { id: true, name: true } },
        interviews: { select: { score: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      candidateId: r.candidateId,
      positionId: r.positionId,
      applicationDate: r.applicationDate,
      candidate: r.candidate,
      currentInterviewStep: r.interviewStep,
      interviews: r.interviews,
    }));
  }

  async countByPosition(positionId: number): Promise<number> {
    return this.prisma.application.count({ where: { positionId } });
  }

  async findByIdAndCandidate(
    applicationId: number,
    candidateId: number,
  ): Promise<ApplicationForStageUpdate | null> {
    const row = await this.prisma.application.findFirst({
      where: { id: applicationId, candidateId },
      select: {
        id: true,
        candidateId: true,
        positionId: true,
        currentInterviewStep: true,
        position: { select: { interviewFlowId: true } },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      candidateId: row.candidateId,
      positionId: row.positionId,
      currentInterviewStepId: row.currentInterviewStep,
      position: row.position,
    };
  }

  async updateCurrentStep(applicationId: number, newStepId: number): Promise<void> {
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { currentInterviewStep: newStepId },
    });
  }
}
