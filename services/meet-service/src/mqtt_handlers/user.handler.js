import { mqttTopics } from "../mqtt";
import * as service from "../services/user.service.js";

export default async function registerMqttHandlers(mqttClient) {
  mqttClient.subscribeAsync(mqttTopics.removeUser);

  mqttClient.on("message", async (topic, message) => {
    if (topic === mqttTopics.removeUser) {
      handleRemoveUser(message, topic);
    }
  });
}

async function handleRemoveUser(message, topic) {
  const user = JSON.parse(message.toString());
  const userId = user?.userId || user?.user_id || user?.id;

  logger.info(
    `Received MQTT message for removed user: ${userId || "unknown"} on topic ${topic}`,
  );

  if (!userId) {
    logger.warn(
      "Could not extract user ID from MQTT message:",
      message.toString(),
    );
    return;
  }

  service
    .removeByUserId(userId)
    .then(() => {
      logger.info(`Removed registrations for user ID ${userId}`);
    })
    .catch((err) => {
      logger.error(`Error removing registrations for user ID ${userId}:`, err);
    });
}
