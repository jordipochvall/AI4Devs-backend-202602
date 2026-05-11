import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { buildApp } from '../../appFactory';
import { buildTestPrisma, truncateAll } from './testDb';
import { seedBase, seedCandidateWithApplication, BaseFixtureIds } from './fixtures';

describe('GET /positions/:id/candidates (integration)', () => {
  let prisma: PrismaClient;
  let app: Express;
  let base: BaseFixtureIds;

  beforeAll(() => {
    prisma = buildTestPrisma();
    app = buildApp(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await truncateAll(prisma);
    base = await seedBase(prisma);
  });

  it('returns 404 when position does not exist', async () => {
    const res = await request(app).get('/positions/999999/candidates');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: expect.stringContaining('Position') });
  });

  it('returns 400 for non-numeric id', async () => {
    const res = await request(app).get('/positions/abc/candidates');
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid pageSize', async () => {
    const res = await request(app).get(`/positions/${base.positionId}/candidates?pageSize=999`);
    expect(res.status).toBe(400);
  });

  it('returns empty result when position has no applications', async () => {
    const res = await request(app).get(`/positions/${base.positionId}/candidates`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      positionId: base.positionId,
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
      candidates: [],
    });
  });

  it('returns candidates with averageScore computed from interviews of that application', async () => {
    await seedCandidateWithApplication(prisma, {
      firstName: 'Alice', lastName: 'Smith', email: 'alice@x.com',
      positionId: base.positionId, currentStepId: base.steps.coding,
      employeeId: base.employeeId,
      scores: [4, 5, 3], applicationDate: new Date('2026-01-10'),
    });
    await seedCandidateWithApplication(prisma, {
      firstName: 'Bob', lastName: 'Jones', email: 'bob@x.com',
      positionId: base.positionId, currentStepId: base.steps.screening,
      employeeId: base.employeeId,
      scores: [], applicationDate: new Date('2026-01-12'),
    });

    const res = await request(app).get(`/positions/${base.positionId}/candidates`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.candidates).toHaveLength(2);
    // Orden: applicationDate DESC → Bob primero
    expect(res.body.candidates[0].fullName).toBe('Bob Jones');
    expect(res.body.candidates[0].averageScore).toBeNull();
    expect(res.body.candidates[0].currentInterviewStep).toEqual({ id: base.steps.screening, name: 'Screening' });
    expect(res.body.candidates[1].fullName).toBe('Alice Smith');
    expect(res.body.candidates[1].averageScore).toBe(4); // (4+5+3)/3
  });

  it('isolates averageScore per application (other applications of same candidate do not count)', async () => {
    // Alice tiene una application en otra position con scores altos; no deben contaminar la media
    const positionA = base.positionId;
    const positionB = base.otherPositionId;

    await seedCandidateWithApplication(prisma, {
      firstName: 'Alice', lastName: 'X', email: 'alice@x.com',
      positionId: positionA, currentStepId: base.steps.coding,
      employeeId: base.employeeId,
      scores: [2, 2],
    });
    // Misma candidata pero otra application a positionB con scores=5
    const candidate = await prisma.candidate.findFirst({ where: { email: 'alice@x.com' } });
    const otherApp = await prisma.application.create({
      data: {
        candidateId: candidate!.id,
        positionId: positionB,
        applicationDate: new Date(),
        currentInterviewStep: base.otherStep.screening,
      },
    });
    await prisma.interview.createMany({
      data: [5, 5].map((s) => ({
        applicationId: otherApp.id,
        interviewStepId: base.otherStep.screening,
        employeeId: base.employeeId,
        interviewDate: new Date(),
        score: s,
        result: 'Passed',
      })),
    });

    const res = await request(app).get(`/positions/${positionA}/candidates`);
    expect(res.status).toBe(200);
    expect(res.body.candidates).toHaveLength(1);
    expect(res.body.candidates[0].averageScore).toBe(2);
  });

  it('paginates results with stable order across pages', async () => {
    // 5 candidatos con applicationDate distinto
    for (let i = 0; i < 5; i++) {
      await seedCandidateWithApplication(prisma, {
        firstName: `Cand${i}`, lastName: 'X', email: `c${i}@x.com`,
        positionId: base.positionId, currentStepId: base.steps.screening,
        employeeId: base.employeeId,
        applicationDate: new Date(`2026-01-${10 + i}`),
      });
    }

    const page1 = await request(app).get(`/positions/${base.positionId}/candidates?page=1&pageSize=2`);
    const page2 = await request(app).get(`/positions/${base.positionId}/candidates?page=2&pageSize=2`);
    const page3 = await request(app).get(`/positions/${base.positionId}/candidates?page=3&pageSize=2`);

    expect(page1.body).toMatchObject({ page: 1, pageSize: 2, total: 5, totalPages: 3 });
    expect(page1.body.candidates).toHaveLength(2);
    expect(page2.body.candidates).toHaveLength(2);
    expect(page3.body.candidates).toHaveLength(1);

    // Sin solapamientos
    const allIds = [
      ...page1.body.candidates.map((c: any) => c.applicationId),
      ...page2.body.candidates.map((c: any) => c.applicationId),
      ...page3.body.candidates.map((c: any) => c.applicationId),
    ];
    expect(new Set(allIds).size).toBe(5);

    // Orden por applicationDate DESC
    expect(page1.body.candidates[0].fullName).toBe('Cand4 X');
    expect(page1.body.candidates[1].fullName).toBe('Cand3 X');
  });

  it('returns empty page when page is beyond total but keeps total accurate', async () => {
    await seedCandidateWithApplication(prisma, {
      firstName: 'A', lastName: 'B', email: 'a@b.com',
      positionId: base.positionId, currentStepId: base.steps.screening,
      employeeId: base.employeeId,
    });

    const res = await request(app).get(`/positions/${base.positionId}/candidates?page=99&pageSize=10`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.candidates).toEqual([]);
  });
});
