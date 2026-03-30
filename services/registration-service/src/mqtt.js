import mqtt from "mqtt";

/**
 * MQTT-Client zum Importieren in den anderen Quelldateien. Ist allerdings
 * nur gesetzt, nachdem `connect()` aufgerufen und erfolgreich eine Verbindung
 * hergestellt wurde.
 */
export let mqttClient = undefined;

/**
 * Konstanten für die abonnierten Topics (um Schreibfehler bei der wiederholten
 * Verwendung derselben Werte zu vermeiden).
 */
export const mqttTopics = {
  removeMeet: "meets/removed",
  cancelMeet: "meets/cancelled",
  removeUser: "users/removed",
};

/**
 * Verbindung zum Message Broker herstellen.
 * @param {string} broker MQTT Broker URL
 * @param {string} username Benutzername (optional)
 * @param {string} password Passwort (optional)
 */
export async function connect(broker, username, password) {
  const options = {};
  if (username) options.username = username;
  if (password) options.password = password;

  mqttClient = await mqtt.connectAsync(broker, options);

  return mqttClient;
}

/**
 * Verbindung zum MQTT-Broker trennen.
 */
export function close() {
  mqttClient?.end();
}
