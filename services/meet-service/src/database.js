// Von Copilot generierte Datei - Instructions in .github wurden nicht beachtet. Prompt: "Hier habe ich dir ein beispiel hinterlegt, wie ein schema in einer anderen applikation angelegt wurde. Mache dasselbe jeweils in der datei database.js in beiden services (meet-service, registration-service) aber für unsere postgres (pool wird in database.js schon angelegt) mit folgendem Schema: *Schema*"

/**
 * Datenbank-Modul für den Meet-Service.
 *
 * Dieses Modul kapselt den Postgres-Pool und die Grundfunktionen:
 * - Abfragen ausführen (`query`)
 * - Transaktionen (`withTransaction`)
 * - Initialisieren der DB-Struktur (`init`)
 * - Cleanup (`close`)
 */
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

/**
 * Postgres-Verbindungspool.
 *
 * Werte werden über Umgebungsvariablen gesetzt:
 * DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */
const pool = new pkg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "meet",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
});

/**
 * Führt eine SQL-Abfrage aus.
 *
 * @param {string} text SQL-Query-String
 * @param {Array} [params] Query-Parameter
 * @returns {Promise<object>} Query-Ergebnis
 */
export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

/**
 * Führt einen Callback innerhalb einer Transaktion aus.
 *
 * @param {Function} callback Async-Funktion (client -> Ergebnis)
 * @returns {Promise<any>} Ergebnis des Callbacks
 */
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

/**
 * Schließt den Datenbank-Pool (z. B. beim Herunterfahren).
 */
export async function close() {
  await pool.end();
}

/**
 * Initialisiert die Schema-Struktur für Meetings und Venues.
 *
 * Wendet SQL-Statements an, um Tabellen und nötige Erweiterungen zu
 * erstellen.
 */
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
