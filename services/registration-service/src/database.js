// Von Copilot generierte Datei - Instructions in .github wurden nicht beachtet. Prompt: "Hier habe ich dir ein beispiel hinterlegt, wie ein schema in einer anderen applikation angelegt wurde. Mache dasselbe jeweils in der datei database.js in beiden services (meet-service, registration-service) aber für unsere postgres (pool wird in database.js schon angelegt) mit folgendem Schema: *Schema*"

import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pkg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "registration",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
});

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

export async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function close() {
  await pool.end();
}

export async function init() {
  await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  await query(`
    CREATE TABLE IF NOT EXISTS "user" (
      user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      display_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS vehicle (
      vehicle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      color TEXT,
      power_hp INTEGER,
      plate_optional TEXT,
      notes TEXT,
      user_id UUID NOT NULL,
      CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS registration (
      registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      meet_id UUID NOT NULL,
      user_id UUID NOT NULL,
      vehicle_id UUID,
      role TEXT NOT NULL CHECK (role IN ('PARTICIPANT', 'VISITOR')),
      status TEXT NOT NULL CHECK (status IN ('CONFIRMED', 'CANCELLED')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      check_in_at TIMESTAMPTZ,
      CONSTRAINT fk_user_reg FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
      CONSTRAINT fk_vehicle_reg FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE SET NULL
    );
  `);
}
