/**
 * Database seed script
 * Populate database with sample tasks
 */

const db = require('../utils/db');
const bcrypt = require('bcrypt');

// Sample tasks for MVP
const sampleTasks = [
  {
    type: 'image_classification',
    question: 'Is there a dog in this image?',
    image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
    correct_answer: 'y',
    reward_coins: 3,
    estimated_seconds: 20
  },
  {
    type: 'image_classification',
    question: 'Is there a car in this image?',
    image_url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
    correct_answer: 'y',
    reward_coins: 3,
    estimated_seconds: 20
  },
  {
    type: 'image_classification',
    question: 'Is this image outdoors?',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    correct_answer: 'y',
    reward_coins: 3,
    estimated_seconds: 20
  },
  {
    type: 'text_classification',
    question: 'Is this text positive or negative? "I love this product! It works great."',
    correct_answer: '1',
    reward_coins: 2,
    estimated_seconds: 15,
    metadata: {
      options: [
        { key: '1', label: 'Positive' },
        { key: '2', label: 'Negative' },
        { key: '3', label: 'Neutral' }
      ]
    }
  },
  {
    type: 'text_classification',
    question: 'Is this text positive or negative? "This is terrible. I want a refund."',
    correct_answer: '2',
    reward_coins: 2,
    estimated_seconds: 15,
    metadata: {
      options: [
        { key: '1', label: 'Positive' },
        { key: '2', label: 'Negative' },
        { key: '3', label: 'Neutral' }
      ]
    }
  },
  {
    type: 'simple_labeling',
    question: 'Rate this image quality (1-5): https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead',
    image_url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead',
    correct_answer: '4',
    reward_coins: 2,
    estimated_seconds: 20,
    metadata: {
      options: [
        { key: '1', label: 'Very Poor' },
        { key: '2', label: 'Poor' },
        { key: '3', label: 'Average' },
        { key: '4', label: 'Good' },
        { key: '5', label: 'Excellent' }
      ]
    }
  }
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const userResult = await db.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['test@vibecoin.sh', 'testuser', hashedPassword]
    );

    if (userResult.rowCount > 0) {
      console.log('✅ Created test user: test@vibecoin.sh / password123');
    } else {
      console.log('ℹ️  Test user already exists');
    }

    // Insert sample tasks
    let insertedCount = 0;
    for (const task of sampleTasks) {
      const result = await db.query(
        `INSERT INTO tasks (type, question, image_url, correct_answer, reward_coins, estimated_seconds, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          task.type,
          task.question,
          task.image_url || null,
          task.correct_answer,
          task.reward_coins,
          task.estimated_seconds,
          JSON.stringify(task.metadata || {})
        ]
      );

      if (result.rowCount > 0) {
        insertedCount++;
      }
    }

    console.log(`✅ Inserted ${insertedCount} sample tasks`);
    console.log('\n✅ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run seed
seed();
