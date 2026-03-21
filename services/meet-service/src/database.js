// Von Copilot generierte Datei - Instructions in .github wurden nicht beachtet. Prompt: "Hier habe ich dir ein beispiel hinterlegt, wie ein schema in einer anderen applikation angelegt wurde. Mache dasselbe jeweils in der datei database.js in beiden services (meet-service, registration-service) aber für unsere postgres (pool wird in database.js schon angelegt) mit folgendem Schema: *Schema*"

import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pkg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "meet",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
});

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

export async function close() {
  await pool.end();
}

export async function init() {
  await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  await query(`
    CREATE TABLE IF NOT EXISTS venue (
      venue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      street TEXT NOT NULL,
      zip TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS meet (
      meet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      start_at TIMESTAMPTZ NOT NULL,
      end_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('PLANNED', 'CANCELLED', 'DONE')),
      organizer_user_id UUID NOT NULL,
      max_participants INTEGER NOT NULL DEFAULT 0,
      max_visitors INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      venue_id UUID NOT NULL,
      CONSTRAINT fk_venue FOREIGN KEY (venue_id) REFERENCES venue(venue_id) ON DELETE RESTRICT
    );
  `);
}
