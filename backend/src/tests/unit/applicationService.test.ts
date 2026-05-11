import { ApplicationService } from '../../application/services/ApplicationService';
import { DomainError, NotFoundError, ValidationError } from '../../application/errors';
import { IApplicationRepository } from '../../domain/repositories/IApplicationRepository';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { IInterviewStepRepository } from '../../domain/repositories/IInterviewStepRepository';

const buildAppRepo = (): jest.Mocked<IApplicationRepository> => ({
  findByPositionPaginated: jest.fn(),
  countByPosition: jest.fn(),
  findByIdAndCandidate: jest.fn(),
  updateCurrentStep: jest.fn(),
});

const buildCandRepo = (): jest.Mocked<ICandidateRepository> => ({
  exists: jest.fn(),
});

const buildStepRepo = (): jest.Mocked<IInterviewStepRepository> => ({
  findById: jest.fn(),
});

describe('ApplicationService.updateCandidateStage', () => {
  let appRepo: jest.Mocked<IApplicationRepository>;
  let candRepo: jest.Mocked<ICandidateRepository>;
  let stepRepo: jest.Mocked<IInterviewStepRepository>;
  let service: ApplicationService;

  const candidateId = 10;
  const applicationId = 100;
  const flowId = 1;
  const currentStepId = 4;
  const newStepId = 5;

  beforeEach(() => {
    appRepo = buildAppRepo();
    candRepo = buildCandRepo();
    stepRepo = buildStepRepo();

    candRepo.exists.mockResolvedValue(true);
    appRepo.findByIdAndCandidate.mockResolvedValue({
      id: applicationId,
      candidateId,
      positionId: 1000,
      currentInterviewStepId: currentStepId,
      position: { interviewFlowId: flowId },
    });
    stepRepo.findById.mockImplementation(async (id) => ({
      id, name: id === newStepId ? 'Manager Interview' : 'Step', interviewFlowId: flowId,
    }));
    appRepo.updateCurrentStep.mockResolvedValue();

    service = new ApplicationService(candRepo, appRepo, stepRepo);
  });

  describe('input validation', () => {
    it.each([0, -1, 1.5, Number.NaN])('rejects candidateId=%p', async (id) => {
      await expect(
        service.updateCandidateStage(id, { applicationId, newInterviewStepId: newStepId }),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it.each([0, -1, 1.5, Number.NaN])('rejects applicationId=%p', async (id) => {
      await expect(
        service.updateCandidateStage(candidateId, { applicationId: id, newInterviewStepId: newStepId }),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it.each([0, -1, 1.5, Number.NaN])('rejects newInterviewStepId=%p', async (id) => {
      await expect(
        service.updateCandidateStage(candidateId, { applicationId, newInterviewStepId: id }),
      ).rejects.toBeInstanceOf(ValidationError);
    });
  });

  it('throws NotFoundError when candidate does not exist', async () => {
    candRepo.exists.mockResolvedValue(false);
    await expect(
      service.updateCandidateStage(candidateId, { applicationId, newInterviewStepId: newStepId }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(appRepo.findByIdAndCandidate).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when application does not exist or does not belong to candidate', async () => {
    appRepo.findByIdAndCandidate.mockResolvedValue(null);
    await expect(
      service.updateCandidateStage(candidateId, { applicationId, newInterviewStepId: newStepId }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when interview step does not exist', async () => {
    stepRepo.findById.mockResolvedValue(null);
    await expect(
      service.updateCandidateStage(candidateId, { applicationId, newInterviewStepId: newStepId }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws DomainError when step does not belong to the position flow', async () => {
    stepRepo.findById.mockResolvedValue({ id: newStepId, name: 'Foreign Step', interviewFlowId: 999 });
    await expect(
      service.updateCandidateStage(candidateId, { applicationId, newInterviewStepId: newStepId }),
    ).rejects.toBeInstanceOf(DomainError);
    expect(appRepo.updateCurrentStep).not.toHaveBeenCalled();
  });

  it('updates the application current step on the happy path', async () => {
    const result = await service.updateCandidateStage(candidateId, {
      applicationId,
      newInterviewStepId: newStepId,
    });
    expect(appRepo.updateCurrentStep).toHaveBeenCalledWith(applicationId, newStepId);
    expect(result).toEqual({
      applicationId,
      candidateId,
      previousInterviewStepId: currentStepId,
      currentInterviewStep: { id: newStepId, name: 'Manager Interview' },
    });
  });

  it('is idempotent: skips repo update when newStep equals currentStep', async () => {
    const result = await service.updateCandidateStage(candidateId, {
      applicationId,
      newInterviewStepId: currentStepId,
    });
    expect(appRepo.updateCurrentStep).not.toHaveBeenCalled();
    expect(result.currentInterviewStep.id).toBe(currentStepId);
    expect(result.previousInterviewStepId).toBe(currentStepId);
  });
});
