import { PrismaClient } from '@prisma/client';

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb_test';

export const buildTestPrisma = (): PrismaClient =>
  new PrismaClient({ datasources: { db: { url: TEST_DATABASE_URL } } });

export const truncateAll = async (prisma: PrismaClient): Promise<void> => {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "Interview",
      "Application",
      "InterviewStep",
      "InterviewFlow",
      "InterviewType",
      "Position",
      "Employee",
      "Company",
      "Resume",
      "WorkExperience",
      "Education",
      "Candidate"
    RESTART IDENTITY CASCADE
  `);
};
