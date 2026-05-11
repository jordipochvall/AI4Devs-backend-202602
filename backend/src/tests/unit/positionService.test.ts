import { PositionService } from '../../application/services/PositionService';
import { NotFoundError, ValidationError } from '../../application/errors';
import {
  ApplicationListItem,
  IApplicationRepository,
} from '../../domain/repositories/IApplicationRepository';
import { IPositionRepository } from '../../domain/repositories/IPositionRepository';

const buildAppRepoMock = (): jest.Mocked<IApplicationRepository> => ({
  findByPositionPaginated: jest.fn(),
  countByPosition: jest.fn(),
  findByIdAndCandidate: jest.fn(),
  updateCurrentStep: jest.fn(),
});

const buildPositionRepoMock = (): jest.Mocked<IPositionRepository> => ({
  findById: jest.fn(),
});

const item = (over: Partial<ApplicationListItem> = {}): ApplicationListItem => ({
  id: 1,
  candidateId: 10,
  positionId: 100,
  applicationDate: new Date('2026-01-01'),
  candidate: { id: 10, firstName: 'John', lastName: 'Doe' },
  currentInterviewStep: { id: 4, name: 'Manager Interview' },
  interviews: [{ score: 4 }, { score: 5 }],
  ...over,
});

describe('PositionService.getCandidatesInProcess', () => {
  let appRepo: jest.Mocked<IApplicationRepository>;
  let positionRepo: jest.Mocked<IPositionRepository>;
  let service: PositionService;

  beforeEach(() => {
    appRepo = buildAppRepoMock();
    positionRepo = buildPositionRepoMock();
    positionRepo.findById.mockResolvedValue({ id: 100, interviewFlowId: 1 });
    appRepo.findByPositionPaginated.mockResolvedValue([]);
    appRepo.countByPosition.mockResolvedValue(0);
    service = new PositionService(positionRepo, appRepo);
  });

  it('throws NotFoundError when position does not exist', async () => {
    positionRepo.findById.mockResolvedValue(null);
    await expect(
      service.getCandidatesInProcess(999, { page: 1, pageSize: 20 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(appRepo.findByPositionPaginated).not.toHaveBeenCalled();
  });

  it('returns empty list when position has no applications', async () => {
    const result = await service.getCandidatesInProcess(100, { page: 1, pageSize: 20 });
    expect(result).toEqual({
      positionId: 100,
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
      candidates: [],
    });
  });

  it('maps applications to DTO with averageScore from interviews of that application only', async () => {
    appRepo.findByPositionPaginated.mockResolvedValue([
      item({ id: 1, candidateId: 10, interviews: [{ score: 4 }, { score: 5 }, { score: 3 }] }),
      item({
        id: 2,
        candidateId: 11,
        candidate: { id: 11, firstName: 'Jane', lastName: 'Smith' },
        currentInterviewStep: { id: 2, name: 'Coding Challenge' },
        interviews: [{ score: 5 }],
      }),
    ]);
    appRepo.countByPosition.mockResolvedValue(2);

    const result = await service.getCandidatesInProcess(100, { page: 1, pageSize: 20 });

    expect(result.candidates).toEqual([
      {
        applicationId: 1,
        candidateId: 10,
        fullName: 'John Doe',
        currentInterviewStep: { id: 4, name: 'Manager Interview' },
        averageScore: 4, // (4+5+3)/3
      },
      {
        applicationId: 2,
        candidateId: 11,
        fullName: 'Jane Smith',
        currentInterviewStep: { id: 2, name: 'Coding Challenge' },
        averageScore: 5,
      },
    ]);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
  });

  it('returns averageScore null when application has no interviews with score', async () => {
    appRepo.findByPositionPaginated.mockResolvedValue([
      item({ interviews: [] }),
      item({ id: 2, interviews: [{ score: null }, { score: null }] }),
    ]);
    appRepo.countByPosition.mockResolvedValue(2);

    const result = await service.getCandidatesInProcess(100, { page: 1, pageSize: 20 });
    expect(result.candidates[0].averageScore).toBeNull();
    expect(result.candidates[1].averageScore).toBeNull();
  });

  it('ignores null scores when computing average', async () => {
    appRepo.findByPositionPaginated.mockResolvedValue([
      item({ interviews: [{ score: 4 }, { score: null }, { score: 2 }] }),
    ]);
    appRepo.countByPosition.mockResolvedValue(1);

    const result = await service.getCandidatesInProcess(100, { page: 1, pageSize: 20 });
    expect(result.candidates[0].averageScore).toBe(3); // (4+2)/2
  });

  it('rounds averageScore to two decimals', async () => {
    appRepo.findByPositionPaginated.mockResolvedValue([
      item({ interviews: [{ score: 4 }, { score: 5 }, { score: 4 }] }),
    ]);
    appRepo.countByPosition.mockResolvedValue(1);

    const result = await service.getCandidatesInProcess(100, { page: 1, pageSize: 20 });
    expect(result.candidates[0].averageScore).toBe(4.33);
  });

  it('passes correct offset and limit to repo for given page', async () => {
    appRepo.countByPosition.mockResolvedValue(73);
    await service.getCandidatesInProcess(100, { page: 3, pageSize: 20 });
    expect(appRepo.findByPositionPaginated).toHaveBeenCalledWith(100, 40, 20);
  });

  it('returns total and totalPages computed from repo count', async () => {
    appRepo.countByPosition.mockResolvedValue(73);
    const result = await service.getCandidatesInProcess(100, { page: 2, pageSize: 20 });
    expect(result.total).toBe(73);
    expect(result.totalPages).toBe(4); // ceil(73/20)
  });

  it('returns empty candidates when page is beyond total but keeps total accurate', async () => {
    appRepo.findByPositionPaginated.mockResolvedValue([]);
    appRepo.countByPosition.mockResolvedValue(5);
    const result = await service.getCandidatesInProcess(100, { page: 99, pageSize: 20 });
    expect(result.candidates).toEqual([]);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(1);
  });

  describe('pagination validation', () => {
    it.each([
      [0, 20],
      [-1, 20],
      [1.5, 20],
      [Number.NaN, 20],
    ])('rejects page=%p', async (page) => {
      await expect(
        service.getCandidatesInProcess(100, { page, pageSize: 20 }),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it.each([
      [1, 0],
      [1, -1],
      [1, 1.5],
      [1, 101],
      [1, Number.NaN],
    ])('rejects pageSize=%p', async (page, pageSize) => {
      await expect(
        service.getCandidatesInProcess(100, { page, pageSize }),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('accepts pageSize=100 (max allowed)', async () => {
      await expect(
        service.getCandidatesInProcess(100, { page: 1, pageSize: 100 }),
      ).resolves.toBeDefined();
    });
  });
});
