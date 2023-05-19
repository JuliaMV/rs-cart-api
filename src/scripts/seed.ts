import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

async function run() {
  const { PG_HOST, PG_PORT, PG_USER, PG_PASS, PG_DATABASE } = process.env;

  const dbOptions = {
    host: PG_HOST,
    port: PG_PORT,
    database: PG_DATABASE,
    user: PG_USER,
    password: PG_PASS,
    sel: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 5000,
  };

  const client = new Client(dbOptions);
  await client.connect();

  try {
    await client.query(`
        create type cart_status as enum ('OPEN', 'ORDERED')
    `);

    await client.query(`
        create table if not exists carts (
            id uuid PRIMARY KEY,
            user_id uuid NOT NULL,
            created_at date NOT NULL,
            updated_at date NOT NULL,
            status cart_status
        )
    `);

    await client.query(`
        insert into carts (id, user_id, created_at, updated_at, status) values
        ('4f368885-8b10-4ae2-8252-6d959bd8afa4', 'a7ab9250-3c96-4d09-8e79-424912e280f0', '2023-05-16', '2023-05-16', 'OPEN'),
        ('b2c24323-72c5-45fe-9fbc-07427629a149', 'f7ab9250-3c00-4d09-8e79-424912e280f0', '2023-05-10', '2023-05-12', 'ORDERED')
    `);

    await client.query(`
        create table if not exists cart_items (
            cart_id uuid,
            FOREIGN KEY (cart_id) REFERENCES carts (id),
            product_id uuid,
            count integer
            
        )
    `);

    await client.query(`
        insert into cart_items (cart_id, product_id, count) values
        ('4f368885-8b10-4ae2-8252-6d959bd8afa4', 'cbc323f5-a6dc-4b74-a07e-97e722fd24d3', 2)
    `);
  } catch (err) {
    console.log('Error during DB population', err);
  } finally {
    client.end();
  }
}

run();
