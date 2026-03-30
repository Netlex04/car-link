// Copilot generated: Implement meet service to match openapi meet-service.yml + database schema.
// Prompt: "implementiere den meet service nun so, dass er: a: auf das in database.js deinierte schema passt b: Sinnvoll entweder query oder withtransaction benutzt und c: Das zurückgibt, was vom controller erwartet wird"

import { query, withTransaction } from "../database.js";
import { throwError } from "../utils.js";
import { mqttClient } from "../mqtt.js";
import { mqttTopics } from "../mqtt.js";

const sql = {
  selectAll: `SELECT m.*, v.name AS venue_name, v.city AS venue_city, v.country AS venue_country
              FROM meet m
              JOIN venue v ON m.venue_id = v.venue_id`,
  selectById: `SELECT m.*, v.name AS venue_name, v.city AS venue_city, v.country AS venue_country
                FROM meet m
                JOIN venue v ON m.venue_id = v.venue_id
                WHERE m.meet_id = $1`,
  selectVenue: "SELECT * FROM venue WHERE venue_id = $1",
  delete: "DELETE FROM meet WHERE meet_id = $1 RETURNING *",
  insert: `INSERT INTO meet (title, description, start_at, end_at, status, venue_id, organizer_user_id, max_participants, max_visitors)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
  update: `UPDATE meet SET title = $1, description = $2, start_at = $3, end_at = $4, status = $5, venue_id = $6, max_participants = $7, max_visitors = $8
            WHERE meet_id = $9 RETURNING *`,
  cancel: "UPDATE meet SET status = 'CANCELLED' WHERE meet_id = $1 RETURNING *",
};

function rowToVenueSummary(row) {
  if (!row) return null;
  return {
    name: row.venue_name,
    city: row.venue_city,
    country: row.venue_country,
  };
}

function rowToMeet(row) {
  if (!row) return null;
  const meet = {
    meetId: row.meet_id,
    title: row.title,
    description: row.description || undefined,
    startAt: row.start_at?.toISOString?.() || row.start_at,
    endAt: row.end_at?.toISOString?.() || row.end_at,
    status: row.status,
    venueId: row.venue_id,
    organizerUserId: row.organizer_user_id,
    maxParticipants: row.max_participants,
    maxVisitors: row.max_visitors,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
  };

  const venueSummary = rowToVenueSummary(row);
  if (venueSummary) {
    meet.venue = venueSummary;
  }

  return meet;
}

function validateMeetCreate(meet) {
  if (!meet || typeof meet !== "object") {
    throwError(
      "BadRequest",
      "Meet payload is required and must be an object",
      400,
    );
  }

  const required = ["title", "startAt", "venueId", "organizerUserId"];
  for (const key of required) {
    if (meet[key] === undefined || meet[key] === "") {
      throwError("BadRequest", `Missing required field: ${key}`, 400);
    }
  }

  return {
    title: String(meet.title),
    description: meet.description == null ? null : String(meet.description),
    startAt: new Date(meet.startAt),
    endAt: meet.endAt ? new Date(meet.endAt) : null,
    status: meet.status ? String(meet.status) : "PLANNED",
    venueId: String(meet.venueId),
    organizerUserId: String(meet.organizerUserId),
    maxParticipants:
      meet.maxParticipants != null ? Number(meet.maxParticipants) : 0,
    maxVisitors: meet.maxVisitors != null ? Number(meet.maxVisitors) : 0,
  };
}

function validateMeetUpdate(meet) {
  if (!meet || typeof meet !== "object") {
    throwError(
      "BadRequest",
      "Meet payload is required and must be an object",
      400,
    );
  }

  return {
    title: meet.title !== undefined ? String(meet.title) : null,
    description:
      meet.description !== undefined ? String(meet.description) : null,
    startAt: meet.startAt !== undefined ? new Date(meet.startAt) : null,
    endAt: meet.endAt !== undefined ? new Date(meet.endAt) : null,
    status: meet.status !== undefined ? String(meet.status) : null,
    venueId: meet.venueId !== undefined ? String(meet.venueId) : null,
    maxParticipants:
      meet.maxParticipants !== undefined ? Number(meet.maxParticipants) : null,
    maxVisitors:
      meet.maxVisitors !== undefined ? Number(meet.maxVisitors) : null,
  };
}

async function ensureVenueExists(venueId) {
  if (!venueId) {
    throwError("BadRequest", "venueId is required", 400);
  }

  const result = await query(sql.selectVenue, [venueId]);
  if (!result.rows.length) {
    throwError("NotFound", "Venue not found", 404);
  }
}

export async function search(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push(`m.status = $${params.length + 1}`);
    params.push(String(filters.status));
  }
  if (filters.from) {
    conditions.push(`m.start_at >= $${params.length + 1}`);
    params.push(new Date(filters.from));
  }
  if (filters.to) {
    conditions.push(`m.start_at <= $${params.length + 1}`);
    params.push(new Date(filters.to));
  }
  if (filters.q) {
    conditions.push(
      `(m.title ILIKE $${params.length + 1} OR m.description ILIKE $${params.length + 1})`,
    );
    params.push(`%${filters.q}%`);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const result = await query(
    `${sql.selectAll}${where} ORDER BY m.start_at`,
    params,
  );
  return result.rows.map(rowToMeet);
}

export async function create(meet) {
  const m = validateMeetCreate(meet);
  await ensureVenueExists(m.venueId);

  const created = await withTransaction(async (client) => {
    const result = await client.query(sql.insert, [
      m.title,
      m.description,
      m.startAt,
      m.endAt,
      m.status,
      m.venueId,
      m.organizerUserId,
      m.maxParticipants,
      m.maxVisitors,
    ]);
    return result.rows[0];
  });

  const response = await query(sql.selectById, [created.meet_id]);
  return rowToMeet(response.rows[0]);
}

export async function read(id) {
  const result = await query(sql.selectById, [id]);
  return rowToMeet(result.rows[0]);
}

export async function update(id, meet) {
  if (!id) {
    throwError("BadRequest", "ID is required", 400);
  }

  const existing = await read(id);
  if (!existing) {
    return null;
  }

  const payload = validateMeetUpdate(meet);
  const updated = {
    title: payload.title !== null ? payload.title : existing.title,
    description:
      payload.description !== null ? payload.description : existing.description,
    startAt: payload.startAt !== null ? payload.startAt : existing.startAt,
    endAt: payload.endAt !== null ? payload.endAt : existing.endAt,
    status: payload.status !== null ? payload.status : existing.status,
    venueId: payload.venueId !== null ? payload.venueId : existing.venueId,
    maxParticipants:
      payload.maxParticipants !== null
        ? payload.maxParticipants
        : existing.maxParticipants,
    maxVisitors:
      payload.maxVisitors !== null ? payload.maxVisitors : existing.maxVisitors,
  };

  if (payload.venueId !== null && payload.venueId !== existing.venueId) {
    await ensureVenueExists(updated.venueId);
  }

  const result = await withTransaction(async (client) => {
    const res = await client.query(sql.update, [
      updated.title,
      updated.description,
      updated.startAt,
      updated.endAt,
      updated.status,
      updated.venueId,
      updated.maxParticipants,
      updated.maxVisitors,
      id,
    ]);
    return res.rows[0];
  });

  return rowToMeet(result);
}

export async function remove(id) {
  if (!id) {
    throwError("BadRequest", "ID is required", 400);
  }

  const existing = await read(id);
  if (!existing) {
    return null;
  }

  const result = await withTransaction(async (client) => {
    const res = await client.query(sql.delete, [id]);
    return res.rows[0];
  });

  if (!result) {
    return null;
  }

  const removedMeet = rowToMeet(result);
  await mqttClient.publish(mqttTopics.removeMeet, JSON.stringify(removedMeet));

  return removedMeet;
}

export async function cancel(id) {
  if (!id) {
    throwError("BadRequest", "ID is required", 400);
  }

  const existing = await read(id);
  if (!existing) {
    return null;
  }

  const result = await withTransaction(async (client) => {
    const res = await client.query(sql.cancel, [id]);
    return res.rows[0];
  });

  if (!result) {
    return null;
  }

  const cancelledMeet = rowToMeet(result);
  await mqttClient.publish(
    mqttTopics.cancelMeet,
    JSON.stringify(cancelledMeet),
  );

  return cancelledMeet;
}
