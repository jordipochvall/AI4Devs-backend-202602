import { DomainError, NotFoundError, ValidationError } from '../errors';
import { IApplicationRepository } from '../../domain/repositories/IApplicationRepository';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { IInterviewStepRepository } from '../../domain/repositories/IInterviewStepRepository';

export interface UpdateStageInput {
  applicationId: number;
  newInterviewStepId: number;
}

export interface UpdateStageResult {
  applicationId: number;
  candidateId: number;
  previousInterviewStepId: number;
  currentInterviewStep: { id: number; name: string };
}

export class ApplicationService {
  constructor(
    private readonly candidateRepo: ICandidateRepository,
    private readonly applicationRepo: IApplicationRepository,
    private readonly stepRepo: IInterviewStepRepository,
  ) {}

  async updateCandidateStage(
    candidateId: number,
    input: UpdateStageInput,
  ): Promise<UpdateStageResult> {
    this.validatePositiveInteger(candidateId, 'candidateId');
    this.validatePositiveInteger(input.applicationId, 'applicationId');
    this.validatePositiveInteger(input.newInterviewStepId, 'newInterviewStepId');

    const candidateExists = await this.candidateRepo.exists(candidateId);
    if (!candidateExists) {
      throw new NotFoundError('Candidate', candidateId);
    }

    const application = await this.applicationRepo.findByIdAndCandidate(
      input.applicationId,
      candidateId,
    );
    if (!application) {
      throw new NotFoundError('Application', input.applicationId);
    }

    const step = await this.stepRepo.findById(input.newInterviewStepId);
    if (!step) {
      throw new NotFoundError('InterviewStep', input.newInterviewStepId);
    }

    if (step.interviewFlowId !== application.position.interviewFlowId) {
      throw new DomainError(
        `InterviewStep '${step.id}' does not belong to the position's interview flow '${application.position.interviewFlowId}'`,
      );
    }

    if (step.id !== application.currentInterviewStepId) {
      await this.applicationRepo.updateCurrentStep(application.id, step.id);
    }

    return {
      applicationId: application.id,
      candidateId: application.candidateId,
      previousInterviewStepId: application.currentInterviewStepId,
      currentInterviewStep: { id: step.id, name: step.name },
    };
  }

  private validatePositiveInteger(value: number, name: string): void {
    if (!Number.isInteger(value) || value < 1) {
      throw new ValidationError(`Invalid ${name} '${value}': must be a positive integer`);
    }
  }
}
