// Copilot-generiert: Registration-Service-Implementierung
// Erzeugt von Copilot als Antwort auf: "Soll man hier prefix verwenden ... count"
// umfasst CRUD + count-by-meetId.

import { query, withTransaction } from "../database.js";
import { throwError } from "../utils.js";

const sql = {
  selectAll: "SELECT * FROM registration",
  selectById: "SELECT * FROM registration WHERE registration_id = $1",
  insert: `INSERT INTO registration (meet_id, user_id, vehicle_id, role, status, check_in_at)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
  update: `UPDATE registration SET meet_id = $1, user_id = $2, vehicle_id = $3, role = $4, status = $5, check_in_at = $6
           WHERE registration_id = $7 RETURNING *`,
  delete: "DELETE FROM registration WHERE registration_id = $1",
  countByMeet:
    "SELECT COUNT(*) AS total, SUM(CASE WHEN role='PARTICIPANT' THEN 1 ELSE 0 END) AS participants, SUM(CASE WHEN role='VISITOR' THEN 1 ELSE 0 END) AS visitors FROM registration WHERE meet_id = $1",
  countByMeetAndRole:
    "SELECT COUNT(*) AS total FROM registration WHERE meet_id = $1 AND role = $2",
  deleteByMeet: "DELETE FROM registration WHERE meet_id = $1",
};

function toRegistration(row) {
  if (!row) return null;
  return {
    registrationId: row.registration_id,
    meetId: row.meet_id,
    userId: row.user_id,
    vehicleId: row.vehicle_id,
    role: row.role,
    status: row.status,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    checkInAt: row.check_in_at
      ? row.check_in_at.toISOString?.() || row.check_in_at
      : null,
  };
}

function validateRegistrationPayload(payload, isCreate = true) {
  if (!payload || typeof payload !== "object") {
    throwError("BadRequest", "Payload is required and must be an object", 400);
  }

  const required = ["meetId", "userId", "role"];
  if (isCreate) {
    for (const f of required) {
      if (payload[f] === undefined || payload[f] === "") {
        throwError("BadRequest", `Missing required field: ${f}`, 400);
      }
    }
  }

  return {
    meetId: payload.meetId !== undefined ? String(payload.meetId) : null,
    userId: payload.userId !== undefined ? String(payload.userId) : null,
    vehicleId:
      payload.vehicleId !== undefined && payload.vehicleId !== null
        ? String(payload.vehicleId)
        : null,
    role: payload.role !== undefined ? String(payload.role) : null,
    status: payload.status !== undefined ? String(payload.status) : "CONFIRMED",
    checkInAt:
      payload.checkInAt !== undefined
        ? payload.checkInAt === null
          ? null
          : new Date(payload.checkInAt)
        : null,
  };
}

export async function search(filters = {}) {
  const params = [];
  const conditions = [];

  if (filters.meetId) {
    params.push(String(filters.meetId));
    conditions.push(`meet_id = $${params.length}`);
  }
  if (filters.userId) {
    params.push(String(filters.userId));
    conditions.push(`user_id = $${params.length}`);
  }
  if (filters.role) {
    params.push(String(filters.role));
    conditions.push(`role = $${params.length}`);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const result = await query(`${sql.selectAll}${where}`, params);
  return result.rows.map(toRegistration);
}

export async function create(payload) {
  const r = validateRegistrationPayload(payload, true);

  const created = await withTransaction(async (client) => {
    const result = await client.query(sql.insert, [
      r.meetId,
      r.userId,
      r.vehicleId,
      r.role,
      r.status,
      r.checkInAt,
    ]);
    return result.rows[0];
  });

  return toRegistration(created);
}

export async function read(id) {
  if (!id) {
    throwError("BadRequest", "ID is required", 400);
  }

  const result = await query(sql.selectById, [id]);
  return toRegistration(result.rows[0]);
}

export async function update(id, payload) {
  if (!id) {
    throwError("BadRequest", "ID is required", 400);
  }

  const existing = await read(id);
  if (!existing) return null;

  const r = validateRegistrationPayload(payload, false);

  const merged = {
    meetId: r.meetId || existing.meetId,
    userId: r.userId || existing.userId,
    vehicleId: r.vehicleId !== null ? r.vehicleId : existing.vehicleId,
    role: r.role || existing.role,
    status: r.status || existing.status,
    checkInAt: r.checkInAt !== null ? r.checkInAt : existing.checkInAt,
  };

  const result = await withTransaction(async (client) => {
    const res = await client.query(sql.update, [
      merged.meetId,
      merged.userId,
      merged.vehicleId,
      merged.role,
      merged.status,
      merged.checkInAt,
      id,
    ]);
    return res.rows[0];
  });

  return toRegistration(result);
}

export async function remove(id) {
  if (!id) {
    throwError("BadRequest", "ID is required", 400);
  }

  const existing = await read(id);
  if (!existing) return null;

  await query(sql.delete, [id]);
  return existing;
}

export async function countByMeet(meetId, role) {
  if (!meetId) {
    throwError("BadRequest", "meetId is required", 400);
  }

  if (role) {
    const result = await query(sql.countByMeetAndRole, [meetId, String(role)]);
    return {
      meetId,
      total: Number(result.rows[0]?.total || 0),
      participants:
        role === "PARTICIPANT" ? Number(result.rows[0]?.total || 0) : 0,
      visitors: role === "VISITOR" ? Number(result.rows[0]?.total || 0) : 0,
    };
  }

  const result = await query(sql.countByMeet, [meetId]);
  return {
    meetId,
    total: Number(result.rows[0]?.total || 0),
    participants: Number(result.rows[0]?.participants || 0),
    visitors: Number(result.rows[0]?.visitors || 0),
  };
}

export async function removeByMeetId(meetId) {
  if (!meetId) {
    throwError("BadRequest", "meetId is required", 400);
  }

  await query(sql.deleteByMeet, [meetId]);
}
