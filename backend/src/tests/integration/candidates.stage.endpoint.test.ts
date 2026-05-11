import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { buildApp } from '../../appFactory';
import { buildTestPrisma, truncateAll } from './testDb';
import { seedBase, seedCandidateWithApplication, BaseFixtureIds } from './fixtures';

describe('PUT /candidates/:id/stage (integration)', () => {
  let prisma: PrismaClient;
  let app: Express;
  let base: BaseFixtureIds;
  let candidateId: number;
  let applicationId: number;

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
    const seeded = await seedCandidateWithApplication(prisma, {
      firstName: 'Alice', lastName: 'Smith', email: 'alice@x.com',
      positionId: base.positionId, currentStepId: base.steps.screening,
      employeeId: base.employeeId,
    });
    candidateId = seeded.candidateId;
    applicationId = seeded.applicationId;
  });

  it('returns 400 for non-numeric candidate id', async () => {
    const res = await request(app).put('/candidates/abc/stage').send({ applicationId, newInterviewStepId: base.steps.coding });
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is missing required fields', async () => {
    const res = await request(app).put(`/candidates/${candidateId}/stage`).send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 when body has non-numeric fields', async () => {
    const res = await request(app)
      .put(`/candidates/${candidateId}/stage`)
      .send({ applicationId: 'foo', newInterviewStepId: base.steps.coding });
    expect(res.status).toBe(400);
  });

  it('returns 404 when candidate does not exist', async () => {
    const res = await request(app)
      .put('/candidates/999999/stage')
      .send({ applicationId, newInterviewStepId: base.steps.coding });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Candidate');
  });

  it('returns 404 when application does not belong to candidate', async () => {
    const other = await seedCandidateWithApplication(prisma, {
      firstName: 'Other', lastName: 'X', email: 'other@x.com',
      positionId: base.positionId, currentStepId: base.steps.screening,
      employeeId: base.employeeId,
    });
    const res = await request(app)
      .put(`/candidates/${candidateId}/stage`)
      .send({ applicationId: other.applicationId, newInterviewStepId: base.steps.coding });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Application');
  });

  it('returns 404 when interview step does not exist', async () => {
    const res = await request(app)
      .put(`/candidates/${candidateId}/stage`)
      .send({ applicationId, newInterviewStepId: 999999 });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('InterviewStep');
  });

  it('returns 422 when step belongs to a different flow than the position', async () => {
    const res = await request(app)
      .put(`/candidates/${candidateId}/stage`)
      .send({ applicationId, newInterviewStepId: base.otherStep.screening });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/does not belong/);

    // Estado en BD no debe haber cambiado
    const app1 = await prisma.application.findUnique({ where: { id: applicationId } });
    expect(app1!.currentInterviewStep).toBe(base.steps.screening);
  });

  it('updates the application stage on the happy path', async () => {
    const res = await request(app)
      .put(`/candidates/${candidateId}/stage`)
      .send({ applicationId, newInterviewStepId: base.steps.coding });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      applicationId,
      candidateId,
      previousInterviewStepId: base.steps.screening,
      currentInterviewStep: { id: base.steps.coding, name: 'Coding' },
    });

    const app1 = await prisma.application.findUnique({ where: { id: applicationId } });
    expect(app1!.currentInterviewStep).toBe(base.steps.coding);
  });

  it('is idempotent when the new stage equals the current one', async () => {
    const res = await request(app)
      .put(`/candidates/${candidateId}/stage`)
      .send({ applicationId, newInterviewStepId: base.steps.screening });
    expect(res.status).toBe(200);
    expect(res.body.currentInterviewStep.id).toBe(base.steps.screening);
    expect(res.body.previousInterviewStepId).toBe(base.steps.screening);
  });
});
