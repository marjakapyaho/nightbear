import { generateSeedData } from 'backend/db/seed';
import { createNodeContext } from 'backend/utils/api';

if (!process.env.DATABASE_URL?.match(/nightbear_dev/))
  throw new Error('Running this script against anything except the dev DB is...suspicious');

void generateSeedData(createNodeContext());
