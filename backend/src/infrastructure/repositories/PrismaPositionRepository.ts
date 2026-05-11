import { PrismaClient } from '@prisma/client';
import {
  IPositionRepository,
  PositionRef,
} from '../../domain/repositories/IPositionRepository';

export class PrismaPositionRepository implements IPositionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(positionId: number): Promise<PositionRef | null> {
    return this.prisma.position.findUnique({
      where: { id: positionId },
      select: { id: true, interviewFlowId: true },
    });
  }
}
