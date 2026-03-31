// Copilot generated: Venue service implementing meet-service.yml API + DB schema.

/**
 * Venue-Service: CRUD-Operationen für Venues.
 *
 * Enthält Validierung, Mapping und DB-Transaktionen für das Venue-Entity.
 */
import { query, withTransaction } from "../database.js";
import { throwError } from "../utils.js";

const sql = {
  selectAll: "SELECT * FROM venue",
  selectById: "SELECT * FROM venue WHERE venue_id = $1",
  insert: `INSERT INTO venue (name, street, zip, city, country, latitude, longitude, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
  update: `UPDATE venue SET name = $1, street = $2, zip = $3, city = $4, country = $5, latitude = $6, longitude = $7, notes = $8
           WHERE venue_id = $9 RETURNING *`,
  delete: "DELETE FROM venue WHERE venue_id = $1",
  countMeets: "SELECT COUNT(*) FROM meet WHERE venue_id = $1",
};

/**
 * Wandelt eine DB-Zeile in das API-Objekt um.
 *
 * @param {object|null} row DB-Zeile oder null
 * @returns {object|null} Venue-Objekt oder null
 */
function rowToVenue(row) {
  if (!row) return null;
  return {
    venueId: row.venue_id,
    name: row.name,
    street: row.street || undefined,
    zip: row.zip || undefined,
    city: row.city,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    notes: row.notes || undefined,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
  };
}

/**
 * Validiert Eingabedaten für die Venue-Erstellung.
 *
 * @param {object} v roher Venue-Body
 * @returns {object} bereinigtes Venue für DB-Insert
 */
function validateVenueCreate(v) {
  if (!v || typeof v !== "object") {
    throwError(
      "BadRequest",
      "Venue payload is required and must be an object",
      400,
    );
  }

  const required = ["name", "city", "country"];
  for (const key of required) {
    if (v[key] === undefined || v[key] === "") {
      throwError("BadRequest", `Missing required field: ${key}`, 400);
    }
  }

  return {
    name: String(v.name),
    street: v.street !== undefined ? String(v.street) : null,
    zip: v.zip !== undefined ? String(v.zip) : null,
    city: String(v.city),
    country: String(v.country),
    latitude: v.latitude != null ? Number(v.latitude) : null,
    longitude: v.longitude != null ? Number(v.longitude) : null,
    notes: v.notes !== undefined ? String(v.notes) : null,
  };
}

/**
 * Validiert Eingabedaten für Venue-Updates.
 *
 * @param {object} v roher Update-Body
 * @returns {object} bereinigtes Venue-Update-Objekt
 */
function validateVenueUpdate(v) {
  if (!v || typeof v !== "object") {
    throwError(
      "BadRequest",
      "Venue payload is required and must be an object",
      400,
    );
  }

  return {
    name: v.name !== undefined ? String(v.name) : null,
    street: v.street !== undefined ? String(v.street) : null,
    zip: v.zip !== undefined ? String(v.zip) : null,
    city: v.city !== undefined ? String(v.city) : null,
    country: v.country !== undefined ? String(v.country) : null,
    latitude: v.latitude !== undefined ? Number(v.latitude) : null,
    longitude: v.longitude !== undefined ? Number(v.longitude) : null,
    notes: v.notes !== undefined ? String(v.notes) : null,
  };
}

/**
 * Liefert alle Venues.
 *
 * @returns {Promise<Array>} Array von Venue-Objekten
 */
export async function search() {
  const result = await query(sql.selectAll);
  return result.rows.map(rowToVenue);
}

/**
 * Erstellt eine neue Venue.
 *
 * @param {object} venue Venue-Daten
 * @returns {Promise<object>} Erstellte Venue
 */
export async function create(venue) {
  const v = validateVenueCreate(venue);

  const created = await withTransaction(async (client) => {
    const result = await client.query(sql.insert, [
      v.name,
      v.street,
      v.zip,
      v.city,
      v.country,
      v.latitude,
      v.longitude,
      v.notes,
    ]);
    return result.rows[0];
  });

  return rowToVenue(created);
}

/**
 * Liefert eine Venue per ID.
 *
 * @param {string} id Venue-ID
 * @returns {Promise<object|null>} Venue oder null
 */
export async function read(id) {
  if (!id) {
    throwError("BadRequest", "ID is required", 400);
  }

  const result = await query(sql.selectById, [id]);
  return rowToVenue(result.rows[0]);
}

/**
 * Aktualisiert eine Venue per ID.
 *
 * @param {string} id Venue-ID
 * @param {object} venue Update-Daten
 * @returns {Promise<object|null>} Aktualisierte Venue oder null
 */
export async function update(id, venue) {
  if (!id) {
    throwError("BadRequest", "ID is required", 400);
  }

  const existing = await read(id);
  if (!existing) {
    return null;
  }

  const payload = validateVenueUpdate(venue);
  const updated = {
    name: payload.name !== null ? payload.name : existing.name,
    street: payload.street !== null ? payload.street : existing.street,
    zip: payload.zip !== null ? payload.zip : existing.zip,
    city: payload.city !== null ? payload.city : existing.city,
    country: payload.country !== null ? payload.country : existing.country,
    latitude: payload.latitude !== null ? payload.latitude : existing.latitude,
    longitude:
      payload.longitude !== null ? payload.longitude : existing.longitude,
    notes: payload.notes !== null ? payload.notes : existing.notes,
  };

  const result = await withTransaction(async (client) => {
    const res = await client.query(sql.update, [
      updated.name,
      updated.street,
      updated.zip,
      updated.city,
      updated.country,
      updated.latitude,
      updated.longitude,
      updated.notes,
      id,
    ]);
    return res.rows[0];
  });

  return rowToVenue(result);
}

/**
 * Löscht eine Venue, wenn sie nicht besetzt ist.
 *
 * @param {string} id Venue-ID
 * @returns {Promise<boolean|null>} true bei Erfolg, null wenn nicht gefunden
 */
export async function remove(id) {
  if (!id) {
    throwError("BadRequest", "ID is required", 400);
  }

  const existing = await read(id);
  if (!existing) {
    return null;
  }

  const meetCount = await query(sql.countMeets, [id]);
  if (Number(meetCount.rows[0].count) > 0) {
    throwError("Conflict", "Venue is still used by one or more meets", 409);
  }

  await withTransaction(async (client) => {
    await client.query(sql.delete, [id]);
  });

  return true;
}
