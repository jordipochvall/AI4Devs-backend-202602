import { PrismaClient } from '@prisma/client';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';

export class PrismaCandidateRepository implements ICandidateRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async exists(candidateId: number): Promise<boolean> {
    const count = await this.prisma.candidate.count({ where: { id: candidateId } });
    return count > 0;
  }
}
