// Copilot-generiert: CRUD-Service für User im Registration-Service
// Entsprechend OpenAPI: /users und /users/{userId}

import { query, withTransaction } from "../database.js";
import { throwError } from "../utils.js";

const sql = {
  selectById: 'SELECT * FROM "user" WHERE user_id = $1',
  selectByEmail: 'SELECT * FROM "user" WHERE email = $1',
  insert: 'INSERT INTO "user" (display_name, email) VALUES ($1,$2) RETURNING *',
  update:
    'UPDATE "user" SET display_name = $1, email = $2 WHERE user_id = $3 RETURNING *',
  delete: 'DELETE FROM "user" WHERE user_id = $1',
  userVehicles: "SELECT * FROM vehicle WHERE user_id = $1",
  userRegistrations: "SELECT 1 FROM registration WHERE user_id = $1 LIMIT 1",
};

function rowToUser(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    displayName: row.display_name,
    email: row.email,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
  };
}

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

export async function read(userId) {
  if (!userId) throwError("BadRequest", "userId is required", 400);
  const result = await query(sql.selectById, [userId]);
  return rowToUser(result.rows[0]);
}

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

  await query(sql.delete, [userId]);
  return existing;
}

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
