import { PrismaClient } from '@prisma/client';

export interface BaseFixtureIds {
  companyId: number;
  flowId: number;
  otherFlowId: number;
  hrTypeId: number;
  techTypeId: number;
  managerTypeId: number;
  steps: { screening: number; coding: number; manager: number };
  otherStep: { screening: number };
  positionId: number;
  otherPositionId: number;
  employeeId: number;
}

/**
 * Inserta un dataset mínimo y predecible para los tests de integración:
 * - 1 company, 2 interview flows (uno para la position bajo test, otro para validar reglas de dominio)
 * - 1 position con su flow + 3 steps (screening, coding, manager)
 * - 1 position alternativa con otro flow + 1 step (para tests de pertenencia de step a flow)
 * - 1 employee entrevistador
 */
export const seedBase = async (prisma: PrismaClient): Promise<BaseFixtureIds> => {
  const company = await prisma.company.create({ data: { name: 'TestCo' } });

  const [flow, otherFlow] = await Promise.all([
    prisma.interviewFlow.create({ data: { description: 'Test flow' } }),
    prisma.interviewFlow.create({ data: { description: 'Other flow' } }),
  ]);

  const [hrType, techType, managerType] = await Promise.all([
    prisma.interviewType.create({ data: { name: 'HR', description: 'HR' } }),
    prisma.interviewType.create({ data: { name: 'Tech', description: 'Tech' } }),
    prisma.interviewType.create({ data: { name: 'Manager', description: 'Mgr' } }),
  ]);

  const screening = await prisma.interviewStep.create({
    data: { interviewFlowId: flow.id, interviewTypeId: hrType.id, name: 'Screening', orderIndex: 1 },
  });
  const coding = await prisma.interviewStep.create({
    data: { interviewFlowId: flow.id, interviewTypeId: techType.id, name: 'Coding', orderIndex: 2 },
  });
  const manager = await prisma.interviewStep.create({
    data: { interviewFlowId: flow.id, interviewTypeId: managerType.id, name: 'Manager', orderIndex: 3 },
  });

  const otherScreening = await prisma.interviewStep.create({
    data: { interviewFlowId: otherFlow.id, interviewTypeId: hrType.id, name: 'Other Screening', orderIndex: 1 },
  });

  const position = await prisma.position.create({
    data: {
      companyId: company.id,
      interviewFlowId: flow.id,
      title: 'Test Position',
      description: 'd',
      location: 'Remote',
      jobDescription: 'jd',
    },
  });

  const otherPosition = await prisma.position.create({
    data: {
      companyId: company.id,
      interviewFlowId: otherFlow.id,
      title: 'Other Position',
      description: 'd',
      location: 'Remote',
      jobDescription: 'jd',
    },
  });

  const employee = await prisma.employee.create({
    data: { companyId: company.id, name: 'Tester', email: 'tester@testco.com', role: 'Interviewer' },
  });

  return {
    companyId: company.id,
    flowId: flow.id,
    otherFlowId: otherFlow.id,
    hrTypeId: hrType.id,
    techTypeId: techType.id,
    managerTypeId: managerType.id,
    steps: { screening: screening.id, coding: coding.id, manager: manager.id },
    otherStep: { screening: otherScreening.id },
    positionId: position.id,
    otherPositionId: otherPosition.id,
    employeeId: employee.id,
  };
};

export interface CandidateWithApplicationOpts {
  firstName: string;
  lastName: string;
  email: string;
  positionId: number;
  currentStepId: number;
  applicationDate?: Date;
  scores?: (number | null)[];
  interviewStepId?: number;
  employeeId: number;
}

export const seedCandidateWithApplication = async (
  prisma: PrismaClient,
  opts: CandidateWithApplicationOpts,
): Promise<{ candidateId: number; applicationId: number }> => {
  const candidate = await prisma.candidate.create({
    data: { firstName: opts.firstName, lastName: opts.lastName, email: opts.email },
  });

  const application = await prisma.application.create({
    data: {
      candidateId: candidate.id,
      positionId: opts.positionId,
      applicationDate: opts.applicationDate ?? new Date(),
      currentInterviewStep: opts.currentStepId,
    },
  });

  if (opts.scores && opts.scores.length > 0) {
    await prisma.interview.createMany({
      data: opts.scores.map((score) => ({
        applicationId: application.id,
        interviewStepId: opts.interviewStepId ?? opts.currentStepId,
        employeeId: opts.employeeId,
        interviewDate: new Date(),
        score,
        result: score === null ? 'Pending' : 'Passed',
      })),
    });
  }

  return { candidateId: candidate.id, applicationId: application.id };
};
