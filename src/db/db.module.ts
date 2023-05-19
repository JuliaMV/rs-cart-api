import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import dotenv from 'dotenv';

import { PG_CONNECTION } from '../constants';

dotenv.config();

const { PG_HOST, PG_PORT, PG_USER, PG_PASS, PG_DATABASE } = process.env;

const dbProvider = {
  provide: PG_CONNECTION,
  useValue: new Pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DATABASE,
    password: PG_PASS,
    port: PG_PORT,
  }),
};

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
