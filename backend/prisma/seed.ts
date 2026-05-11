import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reset() {
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.interviewStep.deleteMany();
  await prisma.interviewFlow.deleteMany();
  await prisma.interviewType.deleteMany();
  await prisma.position.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.company.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.candidate.deleteMany();
}

async function main() {
  await reset();

  // ---------- Companies ----------
  const [lti, acme, datalab] = await Promise.all([
    prisma.company.create({ data: { name: 'LTI' } }),
    prisma.company.create({ data: { name: 'ACME Corp' } }),
    prisma.company.create({ data: { name: 'DataLab Analytics' } }),
  ]);

  // ---------- Interview Types ----------
  const [hrType, techType, codingType, managerType, culturalType] = await Promise.all([
    prisma.interviewType.create({ data: { name: 'HR Screening', description: 'Encaje general, expectativas y disponibilidad' } }),
    prisma.interviewType.create({ data: { name: 'Technical Interview', description: 'Conocimientos técnicos y experiencia' } }),
    prisma.interviewType.create({ data: { name: 'Coding Challenge', description: 'Prueba práctica de programación' } }),
    prisma.interviewType.create({ data: { name: 'Hiring Manager', description: 'Encaje con el equipo y objetivos profesionales' } }),
    prisma.interviewType.create({ data: { name: 'Cultural Fit', description: 'Valores y encaje cultural' } }),
  ]);

  // ---------- Interview Flows ----------
  const devFlow = await prisma.interviewFlow.create({ data: { description: 'Standard development interview process' } });
  const dsFlow = await prisma.interviewFlow.create({ data: { description: 'Data science interview process' } });
  const seniorFlow = await prisma.interviewFlow.create({ data: { description: 'Senior leadership interview process' } });

  // ---------- Interview Steps ----------
  const devSteps = await Promise.all([
    prisma.interviewStep.create({ data: { interviewFlowId: devFlow.id, interviewTypeId: hrType.id, name: 'Initial Screening', orderIndex: 1 } }),
    prisma.interviewStep.create({ data: { interviewFlowId: devFlow.id, interviewTypeId: codingType.id, name: 'Coding Challenge', orderIndex: 2 } }),
    prisma.interviewStep.create({ data: { interviewFlowId: devFlow.id, interviewTypeId: techType.id, name: 'Technical Interview', orderIndex: 3 } }),
    prisma.interviewStep.create({ data: { interviewFlowId: devFlow.id, interviewTypeId: managerType.id, name: 'Manager Interview', orderIndex: 4 } }),
  ]);

  const dsSteps = await Promise.all([
    prisma.interviewStep.create({ data: { interviewFlowId: dsFlow.id, interviewTypeId: hrType.id, name: 'Initial Screening', orderIndex: 1 } }),
    prisma.interviewStep.create({ data: { interviewFlowId: dsFlow.id, interviewTypeId: techType.id, name: 'Technical Interview', orderIndex: 2 } }),
    prisma.interviewStep.create({ data: { interviewFlowId: dsFlow.id, interviewTypeId: managerType.id, name: 'Manager Interview', orderIndex: 3 } }),
  ]);

  const seniorSteps = await Promise.all([
    prisma.interviewStep.create({ data: { interviewFlowId: seniorFlow.id, interviewTypeId: hrType.id, name: 'Initial Screening', orderIndex: 1 } }),
    prisma.interviewStep.create({ data: { interviewFlowId: seniorFlow.id, interviewTypeId: techType.id, name: 'Architecture Deep Dive', orderIndex: 2 } }),
    prisma.interviewStep.create({ data: { interviewFlowId: seniorFlow.id, interviewTypeId: managerType.id, name: 'Director Interview', orderIndex: 3 } }),
    prisma.interviewStep.create({ data: { interviewFlowId: seniorFlow.id, interviewTypeId: culturalType.id, name: 'Cultural Fit', orderIndex: 4 } }),
  ]);

  // ---------- Employees ----------
  const employees = await Promise.all([
    prisma.employee.create({ data: { companyId: lti.id, name: 'Alice Johnson',  email: 'alice.johnson@lti.com',  role: 'Recruiter' } }),
    prisma.employee.create({ data: { companyId: lti.id, name: 'Bob Miller',     email: 'bob.miller@lti.com',     role: 'Hiring Manager' } }),
    prisma.employee.create({ data: { companyId: lti.id, name: 'Carla Núñez',    email: 'carla.nunez@lti.com',    role: 'Tech Lead' } }),
    prisma.employee.create({ data: { companyId: lti.id, name: 'David Kim',      email: 'david.kim@lti.com',      role: 'Engineering Director' } }),
    prisma.employee.create({ data: { companyId: lti.id, name: 'Eva Rossi',      email: 'eva.rossi@lti.com',      role: 'Senior Engineer', isActive: false } }),
    prisma.employee.create({ data: { companyId: acme.id, name: 'Frank Thompson', email: 'frank.thompson@acme.com', role: 'Recruiter' } }),
    prisma.employee.create({ data: { companyId: acme.id, name: 'Grace Liu',     email: 'grace.liu@acme.com',     role: 'Hiring Manager' } }),
    prisma.employee.create({ data: { companyId: datalab.id, name: 'Hugo Martín', email: 'hugo.martin@datalab.io', role: 'Lead Data Scientist' } }),
  ]);
  const [alice, bob, carla, david, , frank, grace, hugo] = employees;

  // ---------- Positions ----------
  const positions = await Promise.all([
    prisma.position.create({
      data: {
        companyId: lti.id,
        interviewFlowId: devFlow.id,
        title: 'Software Engineer',
        description: 'Desarrollo y mantenimiento de aplicaciones full-stack.',
        status: 'Open',
        isVisible: true,
        location: 'Remote (EU)',
        jobDescription: 'Trabajarás en el ATS de LTI: React + Node + Postgres.',
        requirements: '3+ años con TypeScript, React y Node. Experiencia con Postgres.',
        responsibilities: 'Diseñar, implementar y testear features del producto.',
        salaryMin: 50000, salaryMax: 80000,
        employmentType: 'Full-time',
        benefits: 'Seguro médico, 25 días de vacaciones, formación',
        companyDescription: 'LTI es proveedor líder de soluciones HR.',
        applicationDeadline: new Date('2026-09-30'),
        contactInfo: 'hr@lti.com',
      },
    }),
    prisma.position.create({
      data: {
        companyId: lti.id,
        interviewFlowId: dsFlow.id,
        title: 'Data Scientist',
        description: 'Análisis e interpretación de datos complejos.',
        status: 'Open',
        isVisible: true,
        location: 'Barcelona (Híbrido)',
        jobDescription: 'Modelos predictivos sobre el funnel de contratación.',
        requirements: 'Máster en Data Science o afín. Python, SQL, ML.',
        responsibilities: 'Construir modelos y dashboards. Comunicar insights.',
        salaryMin: 55000, salaryMax: 90000,
        employmentType: 'Full-time',
        benefits: 'Seguro médico, stock options',
        companyDescription: 'LTI es proveedor líder de soluciones HR.',
        applicationDeadline: new Date('2026-08-15'),
        contactInfo: 'hr@lti.com',
      },
    }),
    prisma.position.create({
      data: {
        companyId: lti.id,
        interviewFlowId: seniorFlow.id,
        title: 'Engineering Manager',
        description: 'Liderar un equipo de 6-8 ingenieros.',
        status: 'Open',
        isVisible: true,
        location: 'Madrid',
        jobDescription: 'Gestión de personas, roadmap técnico y delivery.',
        requirements: '5+ años de experiencia, 2+ liderando equipos.',
        responsibilities: 'Coaching, planificación, hiring, calidad técnica.',
        salaryMin: 80000, salaryMax: 110000,
        employmentType: 'Full-time',
        benefits: 'Seguro médico, bonus anual, stock options',
        companyDescription: 'LTI es proveedor líder de soluciones HR.',
        applicationDeadline: new Date('2026-10-31'),
        contactInfo: 'hr@lti.com',
      },
    }),
    prisma.position.create({
      data: {
        companyId: acme.id,
        interviewFlowId: devFlow.id,
        title: 'Frontend Developer',
        description: 'Desarrollo del portal de clientes con React.',
        status: 'Open',
        isVisible: true,
        location: 'Valencia',
        jobDescription: 'React, TypeScript, testing y accesibilidad.',
        requirements: '2+ años con React. Conocimiento de a11y.',
        responsibilities: 'Construir componentes reutilizables y mantener el design system.',
        salaryMin: 40000, salaryMax: 60000,
        employmentType: 'Full-time',
        benefits: 'Seguro médico, ticket restaurante',
        companyDescription: 'ACME Corp ofrece soluciones B2B.',
        applicationDeadline: new Date('2026-07-31'),
        contactInfo: 'careers@acme.com',
      },
    }),
    prisma.position.create({
      data: {
        companyId: acme.id,
        interviewFlowId: devFlow.id,
        title: 'Backend Engineer (Java)',
        description: 'Servicios de pago y conciliación.',
        status: 'Closed',
        isVisible: false,
        location: 'Sevilla',
        jobDescription: 'Java 21, Spring Boot, Kafka, Postgres.',
        requirements: '4+ años con Java/Spring. Experiencia con sistemas distribuidos.',
        responsibilities: 'Diseñar e implementar microservicios de alta disponibilidad.',
        salaryMin: 55000, salaryMax: 75000,
        employmentType: 'Full-time',
        benefits: 'Seguro médico, formación',
        companyDescription: 'ACME Corp ofrece soluciones B2B.',
        applicationDeadline: new Date('2026-03-31'),
        contactInfo: 'careers@acme.com',
      },
    }),
    prisma.position.create({
      data: {
        companyId: datalab.id,
        interviewFlowId: dsFlow.id,
        title: 'ML Engineer',
        description: 'Despliegue de modelos a producción.',
        status: 'Draft',
        isVisible: false,
        location: 'Remote',
        jobDescription: 'MLOps, feature stores, observabilidad de modelos.',
        requirements: 'Python, Docker, Kubernetes. Experiencia con MLflow o similar.',
        responsibilities: 'Construir pipelines de ML reproducibles.',
        salaryMin: 60000, salaryMax: 95000,
        employmentType: 'Full-time',
        benefits: 'Seguro médico, presupuesto formación',
        companyDescription: 'DataLab construye productos data-driven.',
        applicationDeadline: new Date('2026-12-31'),
        contactInfo: 'jobs@datalab.io',
      },
    }),
  ]);
  const [pSwe, pDs, pEm, pFe, pBe, pMl] = positions;

  // ---------- Candidates (15) ----------
  type CandSeed = {
    firstName: string; lastName: string; email: string; phone: string; address: string;
    educations: { institution: string; title: string; startDate: string; endDate?: string }[];
    workExperiences: { company: string; position: string; description?: string; startDate: string; endDate?: string }[];
    resume?: { filePath: string; fileType: string };
  };

  const candidatesSeed: CandSeed[] = [
    {
      firstName: 'John', lastName: 'Doe', email: 'john.doe@gmail.com', phone: '600111222', address: '123 Main St, Madrid',
      educations: [{ institution: 'Universidad Politécnica de Madrid', title: 'BSc Computer Science', startDate: '2015-09-01', endDate: '2019-06-01' }],
      workExperiences: [
        { company: 'Eventbrite', position: 'Software Developer', description: 'Aplicaciones web con React y Node', startDate: '2019-07-01', endDate: '2021-08-01' },
        { company: 'Glovo', position: 'Senior Software Engineer', description: 'Equipo de pagos', startDate: '2021-09-01' },
      ],
      resume: { filePath: '/resumes/john_doe.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@gmail.com', phone: '600111223', address: '456 Elm St, Barcelona',
      educations: [
        { institution: 'University of Maryland', title: 'BSc Statistics', startDate: '2012-09-01', endDate: '2016-06-01' },
        { institution: 'Universitat de Barcelona', title: 'MSc Data Science', startDate: '2016-09-01', endDate: '2020-06-01' },
      ],
      workExperiences: [{ company: 'GitLab', position: 'Data Scientist', description: 'Modelos de churn', startDate: '2020-07-01' }],
      resume: { filePath: '/resumes/jane_smith.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Carlos', lastName: 'García', email: 'carlos.garcia@example.com', phone: '600111224', address: '789 Pine St, Sevilla',
      educations: [{ institution: 'Instituto Tecnológico de Monterrey', title: 'Ingeniería en Sistemas', startDate: '2017-01-01', endDate: '2021-12-01' }],
      workExperiences: [{ company: 'Innovaciones Tech', position: 'Ingeniero de Software', description: 'Backend en Python', startDate: '2022-01-01', endDate: '2024-06-01' }],
      resume: { filePath: '/resumes/carlos_garcia.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'María', lastName: 'López', email: 'maria.lopez@example.com', phone: '600111225', address: 'Calle Sol 12, Valencia',
      educations: [{ institution: 'Universitat Politècnica de València', title: 'Grado en Ingeniería Informática', startDate: '2014-09-01', endDate: '2018-06-01' }],
      workExperiences: [
        { company: 'Capgemini', position: 'Frontend Developer', description: 'Angular y React', startDate: '2018-07-01', endDate: '2021-03-01' },
        { company: 'Wallapop', position: 'Senior Frontend Engineer', startDate: '2021-04-01' },
      ],
      resume: { filePath: '/resumes/maria_lopez.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.hassan@example.com', phone: '600111226', address: 'Carrer Aribau 100, Barcelona',
      educations: [{ institution: 'Cairo University', title: 'BSc Computer Engineering', startDate: '2013-09-01', endDate: '2017-06-01' }],
      workExperiences: [{ company: 'Vodafone', position: 'Backend Engineer', description: 'Servicios Java/Spring', startDate: '2017-07-01' }],
      resume: { filePath: '/resumes/ahmed_hassan.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Sofía', lastName: 'Martínez', email: 'sofia.martinez@example.com', phone: '600111227', address: 'Av. Diagonal 200, Barcelona',
      educations: [
        { institution: 'Universidad de Granada', title: 'Grado en Matemáticas', startDate: '2013-09-01', endDate: '2017-06-01' },
        { institution: 'Universidad Carlos III', title: 'Máster en Estadística', startDate: '2017-09-01', endDate: '2019-06-01' },
      ],
      workExperiences: [{ company: 'BBVA', position: 'Data Analyst', startDate: '2019-07-01', endDate: '2023-12-01' }],
      resume: { filePath: '/resumes/sofia_martinez.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Liam', lastName: "O'Brien", email: 'liam.obrien@example.com', phone: '600111228', address: 'Dublin, Ireland',
      educations: [{ institution: 'Trinity College Dublin', title: 'BSc Computer Science', startDate: '2014-09-01', endDate: '2018-06-01' }],
      workExperiences: [
        { company: 'Stripe', position: 'Software Engineer', description: 'Equipo de billing', startDate: '2018-07-01', endDate: '2022-09-01' },
        { company: 'Datadog', position: 'Senior Engineer', startDate: '2022-10-01' },
      ],
      resume: { filePath: '/resumes/liam_obrien.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.tanaka@example.com', phone: '600111229', address: 'Tokio, Japón',
      educations: [{ institution: 'University of Tokyo', title: 'MSc Machine Learning', startDate: '2016-04-01', endDate: '2018-03-31' }],
      workExperiences: [{ company: 'Rakuten', position: 'ML Engineer', description: 'Recomendadores', startDate: '2018-04-01' }],
      resume: { filePath: '/resumes/yuki_tanaka.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Elena', lastName: 'Petrova', email: 'elena.petrova@example.com', phone: '600111230', address: 'Berlín, Alemania',
      educations: [{ institution: 'TU Berlin', title: 'MSc Software Engineering', startDate: '2015-10-01', endDate: '2018-09-30' }],
      workExperiences: [
        { company: 'SAP', position: 'Software Engineer', startDate: '2018-10-01', endDate: '2022-06-01' },
        { company: 'N26', position: 'Engineering Manager', description: 'Equipo de onboarding', startDate: '2022-07-01' },
      ],
      resume: { filePath: '/resumes/elena_petrova.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Pablo', lastName: 'Ruiz', email: 'pablo.ruiz@example.com', phone: '600111231', address: 'Bilbao',
      educations: [{ institution: 'Universidad del País Vasco', title: 'Grado en Ingeniería Informática', startDate: '2018-09-01', endDate: '2022-06-01' }],
      workExperiences: [{ company: 'Idealista', position: 'Junior Frontend Developer', startDate: '2022-09-01' }],
      resume: { filePath: '/resumes/pablo_ruiz.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Aisha', lastName: 'Khan', email: 'aisha.khan@example.com', phone: '600111232', address: 'Londres, UK',
      educations: [{ institution: 'Imperial College London', title: 'BSc Computing', startDate: '2017-09-01', endDate: '2020-06-01' }],
      workExperiences: [{ company: 'Revolut', position: 'Backend Engineer', startDate: '2020-07-01' }],
      resume: { filePath: '/resumes/aisha_khan.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Marco', lastName: 'Bianchi', email: 'marco.bianchi@example.com', phone: '600111233', address: 'Milán, Italia',
      educations: [{ institution: 'Politecnico di Milano', title: 'MSc Computer Science', startDate: '2014-09-01', endDate: '2017-06-01' }],
      workExperiences: [
        { company: 'TIM', position: 'Software Engineer', startDate: '2017-07-01', endDate: '2020-12-01' },
        { company: 'Satispay', position: 'Tech Lead', startDate: '2021-01-01' },
      ],
      resume: { filePath: '/resumes/marco_bianchi.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Nora', lastName: 'Andersen', email: 'nora.andersen@example.com', phone: '600111234', address: 'Copenhague, Dinamarca',
      educations: [{ institution: 'University of Copenhagen', title: 'MSc Data Science', startDate: '2018-09-01', endDate: '2020-06-01' }],
      workExperiences: [{ company: 'Maersk', position: 'Data Scientist', description: 'Forecast de demanda', startDate: '2020-07-01' }],
      resume: { filePath: '/resumes/nora_andersen.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Diego', lastName: 'Fernández', email: 'diego.fernandez@example.com', phone: '600111235', address: 'Buenos Aires, Argentina',
      educations: [{ institution: 'Universidad de Buenos Aires', title: 'Licenciatura en Ciencias de la Computación', startDate: '2012-03-01', endDate: '2017-12-01' }],
      workExperiences: [
        { company: 'MercadoLibre', position: 'Software Engineer', startDate: '2018-01-01', endDate: '2022-08-01' },
        { company: 'Globant', position: 'Tech Lead', startDate: '2022-09-01' },
      ],
      resume: { filePath: '/resumes/diego_fernandez.pdf', fileType: 'application/pdf' },
    },
    {
      firstName: 'Olivia', lastName: 'Schmidt', email: 'olivia.schmidt@example.com', phone: '600111236', address: 'Múnich, Alemania',
      educations: [{ institution: 'TU München', title: 'BSc Informatik', startDate: '2019-10-01', endDate: '2022-09-30' }],
      workExperiences: [{ company: 'BMW', position: 'Working Student – Software', startDate: '2021-04-01', endDate: '2022-09-30' }],
      // Sin resume — caso límite válido
    },
  ];

  const candidates = await Promise.all(
    candidatesSeed.map((c) =>
      prisma.candidate.create({
        data: {
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          address: c.address,
          educations: { create: c.educations.map((e) => ({ ...e, startDate: new Date(e.startDate), endDate: e.endDate ? new Date(e.endDate) : null })) },
          workExperiences: { create: c.workExperiences.map((w) => ({ ...w, startDate: new Date(w.startDate), endDate: w.endDate ? new Date(w.endDate) : null })) },
          resumes: c.resume ? { create: [{ ...c.resume, uploadDate: new Date() }] } : undefined,
        },
      }),
    ),
  );

  // ---------- Applications + Interviews ----------
  // Helper para crear application + sus entrevistas pasadas
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };

  type Plan = {
    candidateIdx: number;
    position: typeof pSwe;
    flowSteps: typeof devSteps;
    currentStepIdx: number;
    notes?: string;
    interviews: { stepIdx: number; employee: typeof alice; daysAgo: number; result: 'Passed' | 'Failed' | 'Pending'; score?: number; notes?: string }[];
  };

  const plans: Plan[] = [
    // John -> SWE -> en Manager interview, todo passed
    {
      candidateIdx: 0, position: pSwe, flowSteps: devSteps, currentStepIdx: 3,
      notes: 'Candidato muy fuerte, referido por Carla.',
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 30, result: 'Passed', score: 4, notes: 'Buen encaje, expectativas realistas' },
        { stepIdx: 1, employee: carla, daysAgo: 22, result: 'Passed', score: 5, notes: 'Resolvió el coding challenge en 35 min' },
        { stepIdx: 2, employee: carla, daysAgo: 12, result: 'Passed', score: 4, notes: 'Buen system design' },
      ],
    },
    // Jane -> Data Scientist -> Hired
    {
      candidateIdx: 1, position: pDs, flowSteps: dsSteps, currentStepIdx: 2,
      notes: 'Hired - empieza el 2026-06-01',
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 45, result: 'Passed', score: 5, notes: 'Excelente comunicación' },
        { stepIdx: 1, employee: hugo, daysAgo: 35, result: 'Passed', score: 5, notes: 'Sólida en estadística y ML' },
        { stepIdx: 2, employee: bob, daysAgo: 20, result: 'Passed', score: 5, notes: 'Encaje cultural perfecto. OFERTA ACEPTADA.' },
      ],
    },
    // Carlos -> SWE -> Failed coding
    {
      candidateIdx: 2, position: pSwe, flowSteps: devSteps, currentStepIdx: 1,
      notes: 'No supera el coding challenge.',
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 25, result: 'Passed', score: 3, notes: 'Encaje OK' },
        { stepIdx: 1, employee: carla, daysAgo: 15, result: 'Failed', score: 2, notes: 'No completó el ejercicio en el tiempo dado' },
      ],
    },
    // María -> Frontend (ACME) -> en proceso, technical pending
    {
      candidateIdx: 3, position: pFe, flowSteps: devSteps, currentStepIdx: 2,
      interviews: [
        { stepIdx: 0, employee: frank, daysAgo: 10, result: 'Passed', score: 4, notes: 'Perfil senior, expectativa salarial alta' },
        { stepIdx: 1, employee: frank, daysAgo: 4, result: 'Passed', score: 5, notes: 'Excelente prueba técnica' },
      ],
    },
    // Ahmed -> Backend Java (closed) -> rejected
    {
      candidateIdx: 4, position: pBe, flowSteps: devSteps, currentStepIdx: 2,
      notes: 'Posición cerrada antes de finalizar el proceso.',
      interviews: [
        { stepIdx: 0, employee: frank, daysAgo: 60, result: 'Passed', score: 4 },
        { stepIdx: 1, employee: frank, daysAgo: 50, result: 'Passed', score: 4 },
        { stepIdx: 2, employee: grace, daysAgo: 40, result: 'Failed', score: 3, notes: 'Buen perfil técnico pero ya teníamos otro candidato avanzado' },
      ],
    },
    // Sofía -> Data Scientist -> screening passed, esperando técnica
    {
      candidateIdx: 5, position: pDs, flowSteps: dsSteps, currentStepIdx: 1,
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 5, result: 'Passed', score: 4, notes: 'Buen background analítico' },
      ],
    },
    // Liam -> Engineering Manager -> en arquitectura
    {
      candidateIdx: 6, position: pEm, flowSteps: seniorSteps, currentStepIdx: 1,
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 8, result: 'Passed', score: 5, notes: 'Liderazgo claro, busca cambio' },
      ],
    },
    // Yuki -> ML (draft) -> solo aplicado
    {
      candidateIdx: 7, position: pMl, flowSteps: dsSteps, currentStepIdx: 0,
      notes: 'Aplicación recibida, posición aún en Draft.',
      interviews: [],
    },
    // Elena -> Engineering Manager -> finalista
    {
      candidateIdx: 8, position: pEm, flowSteps: seniorSteps, currentStepIdx: 3,
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 35, result: 'Passed', score: 5 },
        { stepIdx: 1, employee: david, daysAgo: 25, result: 'Passed', score: 5, notes: 'Arquitectura sólida' },
        { stepIdx: 2, employee: david, daysAgo: 15, result: 'Passed', score: 5, notes: 'Excelente entrevista con dirección' },
      ],
    },
    // Pablo -> Frontend (ACME) -> screening solo
    {
      candidateIdx: 9, position: pFe, flowSteps: devSteps, currentStepIdx: 0,
      interviews: [],
    },
    // Aisha -> SWE -> tech passed
    {
      candidateIdx: 10, position: pSwe, flowSteps: devSteps, currentStepIdx: 2,
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 20, result: 'Passed', score: 4 },
        { stepIdx: 1, employee: carla, daysAgo: 10, result: 'Passed', score: 4, notes: 'Solución limpia, buena complejidad' },
      ],
    },
    // Marco -> Engineering Manager -> screening pending result
    {
      candidateIdx: 11, position: pEm, flowSteps: seniorSteps, currentStepIdx: 0,
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 2, result: 'Pending', notes: 'Pendiente de feedback' },
      ],
    },
    // Nora -> Data Scientist -> failed manager
    {
      candidateIdx: 12, position: pDs, flowSteps: dsSteps, currentStepIdx: 2,
      notes: 'Rechazado en última fase.',
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 40, result: 'Passed', score: 4 },
        { stepIdx: 1, employee: hugo, daysAgo: 30, result: 'Passed', score: 4 },
        { stepIdx: 2, employee: bob, daysAgo: 18, result: 'Failed', score: 2, notes: 'No vimos encaje con el equipo' },
      ],
    },
    // Diego -> SWE -> en coding
    {
      candidateIdx: 13, position: pSwe, flowSteps: devSteps, currentStepIdx: 1,
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 6, result: 'Passed', score: 4 },
      ],
    },
    // Olivia -> Frontend ACME y SWE LTI (doble aplicación)
    {
      candidateIdx: 14, position: pFe, flowSteps: devSteps, currentStepIdx: 0,
      notes: 'Recién graduada, perfil junior.',
      interviews: [],
    },
    {
      candidateIdx: 14, position: pSwe, flowSteps: devSteps, currentStepIdx: 0,
      interviews: [
        { stepIdx: 0, employee: alice, daysAgo: 1, result: 'Pending' },
      ],
    },
  ];

  for (const plan of plans) {
    const application = await prisma.application.create({
      data: {
        positionId: plan.position.id,
        candidateId: candidates[plan.candidateIdx].id,
        applicationDate: daysAgo(plan.interviews[0]?.daysAgo ?? 1),
        currentInterviewStep: plan.flowSteps[plan.currentStepIdx].id,
        notes: plan.notes,
      },
    });

    if (plan.interviews.length > 0) {
      await prisma.interview.createMany({
        data: plan.interviews.map((i) => ({
          applicationId: application.id,
          interviewStepId: plan.flowSteps[i.stepIdx].id,
          employeeId: i.employee.id,
          interviewDate: daysAgo(i.daysAgo),
          result: i.result,
          score: i.score ?? null,
          notes: i.notes ?? null,
        })),
      });
    }
  }

  // ---------- Resumen ----------
  const counts = {
    companies: await prisma.company.count(),
    employees: await prisma.employee.count(),
    interviewTypes: await prisma.interviewType.count(),
    interviewFlows: await prisma.interviewFlow.count(),
    interviewSteps: await prisma.interviewStep.count(),
    positions: await prisma.position.count(),
    candidates: await prisma.candidate.count(),
    educations: await prisma.education.count(),
    workExperiences: await prisma.workExperience.count(),
    resumes: await prisma.resume.count(),
    applications: await prisma.application.count(),
    interviews: await prisma.interview.count(),
  };
  console.log('Seed completado:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
