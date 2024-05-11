import { generateSeedData } from 'backend/db/seed';
import { createNodeContext } from 'backend/utils/api';

if (!process.env.DATABASE_URL?.match(/nightbear_test/))
  throw new Error('Running this script against anything except the test DB is... suspicious');

void generateSeedData(createNodeContext());
