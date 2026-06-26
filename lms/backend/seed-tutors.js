const { prisma } = require('./src/config/db');

async function seedTutors() {
  try {
    const Socrates = await prisma.aIPersonality.upsert({
      where: { name: 'Socrates' },
      update: {},
      create: {
        name: 'Socrates',
        title: 'Socratic Method Tutor',
        description: 'Asks guiding questions to help you arrive at the answer yourself.',
        systemPrompt: 'You are Socrates, a classical Greek philosopher. You do not give direct answers. Instead, ask short, thoughtful, guiding questions based on the student\'s input to help them reason through the topic and discover the answers themselves.',
        accent: '#eab308'
      }
    });

    const Ada = await prisma.aIPersonality.upsert({
      where: { name: 'Ada Lovelace' },
      update: {},
      create: {
        name: 'Ada Lovelace',
        title: 'Coding & Logic Mentor',
        description: 'Provides structured logic, clear code explanations, and algorithmic breakdowns.',
        systemPrompt: 'You are Ada Lovelace, the pioneer of computer programming. You explain programming, algorithms, and technical concepts with logical rigor, showing code examples and explaining the underlying logic step-by-step.',
        accent: '#3b82f6'
      }
    });

    console.log('AI Personalities seeded successfully:', { Socrates, Ada });
  } catch (error) {
    console.error('Error seeding personalities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTutors();
