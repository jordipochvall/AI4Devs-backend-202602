import { PrismaClient } from '@prisma/client';
import {
  IInterviewStepRepository,
  InterviewStepRef,
} from '../../domain/repositories/IInterviewStepRepository';

export class PrismaInterviewStepRepository implements IInterviewStepRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(stepId: number): Promise<InterviewStepRef | null> {
    return this.prisma.interviewStep.findUnique({
      where: { id: stepId },
      select: { id: true, name: true, interviewFlowId: true },
    });
  }
}
