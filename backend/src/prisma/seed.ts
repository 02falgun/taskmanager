import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo@1234', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@tms.dev' },
    update: {},
    create: {
      name: 'Alex Johnson',
      email: 'demo@tms.dev',
      password: hashedPassword,
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  await prisma.task.deleteMany({
    where: { userId: user.id },
  });

  console.log('🧹 Reset demo tasks');

  // Create sample tasks
  const tasks = [
    {
      title: 'Design new landing page',
      description: 'Create mockups and implement the redesigned marketing landing page with modern UI',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      tags: ['design', 'frontend'],
      order: 0,
    },
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tags: ['devops', 'infrastructure'],
      order: 1,
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST API endpoints using OpenAPI/Swagger specification',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      tags: ['documentation', 'backend'],
      order: 2,
    },
    {
      title: 'Implement dark mode',
      description: 'Add dark/light mode toggle with system preference detection',
      status: TaskStatus.COMPLETED,
      priority: Priority.LOW,
      tags: ['frontend', 'ui'],
      order: 3,
    },
    {
      title: 'Performance optimization',
      description: 'Audit and optimize database queries, add Redis caching layer',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      tags: ['performance', 'backend'],
      order: 4,
    },
    {
      title: 'User onboarding flow',
      description: 'Create interactive onboarding experience for new user registration',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      tags: ['ux', 'frontend'],
      order: 5,
    },
    {
      title: 'Security audit',
      description: 'Conduct comprehensive security review and penetration testing',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      tags: ['security'],
      order: 6,
    },
    {
      title: 'Mobile app prototype',
      description: 'Build React Native prototype for iOS and Android',
      status: TaskStatus.COMPLETED,
      priority: Priority.MEDIUM,
      tags: ['mobile', 'prototype'],
      order: 7,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: { ...task, userId: user.id },
    });
  }

  console.log(`✅ Created ${tasks.length} sample tasks`);
  console.log('\n🎉 Seed completed successfully!');
  console.log('   Demo login: demo@tms.dev / Demo@1234');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
