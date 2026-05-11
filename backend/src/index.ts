import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { buildApp } from './appFactory';

dotenv.config();

const prisma = new PrismaClient();
const app = buildApp(prisma);

const port = 3010;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export { app };
export default app;
