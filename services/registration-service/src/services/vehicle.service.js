// Copilot-generiert: CRUD-Service für Vehicle im Registration-Service
// Entsprechend OpenAPI: /users/{userId}/vehicles + /vehicles/{vehicleId}

import { query, withTransaction } from "../database.js";
import { throwError } from "../utils.js";

const sql = {
  selectById: "SELECT * FROM vehicle WHERE vehicle_id = $1",
  selectByUser: "SELECT * FROM vehicle WHERE user_id = $1",
  insert: `INSERT INTO vehicle (make, model, year, color, power_hp, plate_optional, notes, user_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
  update: `UPDATE vehicle SET make = $1, model = $2, year = $3, color = $4, power_hp = $5, plate_optional = $6, notes = $7
           WHERE vehicle_id = $8 RETURNING *`,
  delete: "DELETE FROM vehicle WHERE vehicle_id = $1",
  countRegistrations:
    "SELECT 1 FROM registration WHERE vehicle_id = $1 LIMIT 1",
};

function rowToVehicle(row) {
  if (!row) return null;
  return {
    vehicleId: row.vehicle_id,
    userId: row.user_id,
    make: row.make,
    model: row.model,
    year: row.year,
    color: row.color,
    powerHp: row.power_hp,
    plateOptional: row.plate_optional,
    notes: row.notes,
  };
}

function validateVehiclePayload(payload, isCreate = true) {
  if (!payload || typeof payload !== "object") {
    throwError(
      "BadRequest",
      "Vehicle payload is required and must be an object",
      400,
    );
  }

  if (isCreate) {
    if (!payload.make || !payload.model) {
      throwError("BadRequest", "Missing required field: make or model", 400);
    }
  }

  return {
    make: payload.make !== undefined ? String(payload.make) : null,
    model: payload.model !== undefined ? String(payload.model) : null,
    year: payload.year !== undefined ? Number(payload.year) : null,
    color: payload.color !== undefined ? String(payload.color) : null,
    powerHp: payload.powerHp !== undefined ? Number(payload.powerHp) : null,
    plateOptional:
      payload.plateOptional !== undefined
        ? String(payload.plateOptional)
        : null,
    notes: payload.notes !== undefined ? String(payload.notes) : null,
    userId: payload.userId !== undefined ? String(payload.userId) : null,
  };
}

export async function search(filters = {}) {
  if (filters.userId) {
    const result = await query(sql.selectByUser, [filters.userId]);
    return result.rows.map(rowToVehicle);
  }
  const result = await query("SELECT * FROM vehicle");
  return result.rows.map(rowToVehicle);
}

export async function create(userId, payload) {
  const vehicle = validateVehiclePayload(payload, true);

  if (!userId) {
    throwError("BadRequest", "userId is required in path", 400);
  }

  const created = await withTransaction(async (client) => {
    const result = await client.query(sql.insert, [
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.color,
      vehicle.powerHp,
      vehicle.plateOptional,
      vehicle.notes,
      userId,
    ]);
    return result.rows[0];
  });

  return rowToVehicle(created);
}

export async function read(vehicleId) {
  if (!vehicleId) throwError("BadRequest", "vehicleId is required", 400);
  const result = await query(sql.selectById, [vehicleId]);
  return rowToVehicle(result.rows[0]);
}

export async function update(vehicleId, payload) {
  if (!vehicleId) throwError("BadRequest", "vehicleId is required", 400);

  const existing = await read(vehicleId);
  if (!existing) return null;

  const vehicle = validateVehiclePayload(payload, false);

  const merged = {
    make: vehicle.make || existing.make,
    model: vehicle.model || existing.model,
    year: vehicle.year !== null ? vehicle.year : existing.year,
    color: vehicle.color !== null ? vehicle.color : existing.color,
    powerHp: vehicle.powerHp !== null ? vehicle.powerHp : existing.powerHp,
    plateOptional:
      vehicle.plateOptional !== null
        ? vehicle.plateOptional
        : existing.plateOptional,
    notes: vehicle.notes !== null ? vehicle.notes : existing.notes,
  };

  const result = await withTransaction(async (client) => {
    const res = await client.query(sql.update, [
      merged.make,
      merged.model,
      merged.year,
      merged.color,
      merged.powerHp,
      merged.plateOptional,
      merged.notes,
      vehicleId,
    ]);
    return res.rows[0];
  });

  return rowToVehicle(result);
}

export async function remove(vehicleId) {
  if (!vehicleId) throwError("BadRequest", "vehicleId is required", 400);

  const existing = await read(vehicleId);
  if (!existing) return null;

  const hasReg = await query(sql.countRegistrations, [vehicleId]);
  if (hasReg.rows.length > 0) {
    throwError(
      "Conflict",
      "Vehicle is still referenced by one or more registrations",
      409,
    );
  }

  await query(sql.delete, [vehicleId]);
  return existing;
}
