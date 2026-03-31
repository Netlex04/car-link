// Copilot-generiert: CRUD-Service für User im Registration-Service
// Entsprechend OpenAPI: /users und /users/{userId}

import { query, withTransaction } from "../database.js";
import { mqttClient } from "../mqtt.js";
import { throwError } from "../utils.js";

const sql = {
  selectById: 'SELECT * FROM "user" WHERE user_id = $1',
  selectByEmail: 'SELECT * FROM "user" WHERE email = $1',
  insert: 'INSERT INTO "user" (display_name, email) VALUES ($1,$2) RETURNING *',
  update:
    'UPDATE "user" SET display_name = $1, email = $2 WHERE user_id = $3 RETURNING *',
  delete: 'DELETE FROM "user" WHERE user_id = $1 RETURNING *',
  userVehicles: "SELECT * FROM vehicle WHERE user_id = $1",
  userRegistrations: "SELECT 1 FROM registration WHERE user_id = $1 LIMIT 1",
};

/**
 * Formatiert eine Benutzer-DB-Zeile in ein API-Objekt.
 *
 * @param {object|null} row DB-Zeile
 * @returns {object|null} User-Objekt oder null
 */
function rowToUser(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    displayName: row.display_name,
    email: row.email,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
  };
}

/**
 * Validiert User-Payload für create/update.
 *
 * @param {object} payload Payload
 * @param {boolean} [isCreate=true] true bei Erstellung
 * @returns {{displayName: string|null, email: string|null}}
 */
function validateUserPayload(payload, isCreate = true) {
  if (!payload || typeof payload !== "object") {
    throwError(
      "BadRequest",
      "User payload is required and must be an object",
      400,
    );
  }

  if (isCreate) {
    if (!payload.displayName || !payload.email) {
      throwError(
        "BadRequest",
        "Missing required field: displayName or email",
        400,
      );
    }
  }

  return {
    displayName:
      payload.displayName !== undefined ? String(payload.displayName) : null,
    email: payload.email !== undefined ? String(payload.email) : null,
  };
}

/**
 * Erstellt einen neuen Nutzer.
 *
 * @param {object} payload Nutzerdaten
 * @returns {Promise<object>} Erstellter Nutzer
 */
export async function create(payload) {
  const user = validateUserPayload(payload, true);

  const existing = await query(sql.selectByEmail, [user.email]);
  if (existing.rows.length) {
    throwError("Conflict", "Email already exists", 409);
  }

  const created = await withTransaction(async (client) => {
    const result = await client.query(sql.insert, [
      user.displayName,
      user.email,
    ]);
    return result.rows[0];
  });

  return rowToUser(created);
}

/**
 * Liest einen Benutzer per ID.
 *
 * @param {string} userId Benutzer-ID
 * @returns {Promise<object|null>} Benutzer oder null
 */
export async function read(userId) {
  if (!userId) throwError("BadRequest", "userId is required", 400);
  const result = await query(sql.selectById, [userId]);
  return rowToUser(result.rows[0]);
}

/**
 * Aktualisiert einen Benutzer.
 *
 * @param {string} userId Benutzer-ID
 * @param {object} payload Update-Daten
 * @returns {Promise<object|null>} Aktualisierter Benutzer oder null
 */
export async function update(userId, payload) {
  if (!userId) throwError("BadRequest", "userId is required", 400);

  const existing = await read(userId);
  if (!existing) return null;

  const user = validateUserPayload(payload, false);
  const newEmail = user.email || existing.email;

  if (newEmail !== existing.email) {
    const other = await query(sql.selectByEmail, [newEmail]);
    if (other.rows.length) {
      throwError("Conflict", "Email already exists", 409);
    }
  }

  const updated = await withTransaction(async (client) => {
    const result = await client.query(sql.update, [
      user.displayName || existing.displayName,
      newEmail,
      userId,
    ]);
    return result.rows[0];
  });

  return rowToUser(updated);
}

/**
 * Entfernt einen Benutzer (wenn keine Referenzen existieren).
 *
 * @param {string} userId Benutzer-ID
 * @returns {Promise<object|null>} Entferntes Benutzerobjekt oder null
 */
export async function remove(userId) {
  if (!userId) throwError("BadRequest", "userId is required", 400);

  const existing = await read(userId);
  if (!existing) return null;

  const hasReg = await query(sql.userRegistrations, [userId]);
  const hasVeh = await query(sql.userVehicles, [userId]);

  if (hasReg.rows.length > 0 || hasVeh.rows.length > 0) {
    throwError(
      "Conflict",
      "User is still referenced by registrations or vehicles",
      409,
    );
  }

  const result = await query(sql.delete, [userId]);
  if (!result.rows.length) {
    return null;
  }

  await mqttClient.publish(
    "users/removed",
    JSON.stringify(rowToUser(result.rows[0])),
  );

  return rowToUser(result.rows[0]);
}

/**
 * Listet Fahrzeuge eines Nutzers auf.
 *
 * @param {string} userId Benutzer-ID
 * @returns {Promise<Array>} Array von Fahrzeugen
 */
export async function listVehicles(userId) {
  if (!userId) throwError("BadRequest", "userId is required", 400);

  await read(userId);
  const result = await query(sql.userVehicles, [userId]);

  return result.rows.map((row) => ({
    vehicleId: row.vehicle_id,
    userId: row.user_id,
    make: row.make,
    model: row.model,
    year: row.year,
    color: row.color,
    powerHp: row.power_hp,
    plateOptional: row.plate_optional,
    notes: row.notes,
  }));
}
