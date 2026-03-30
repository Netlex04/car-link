import { logger } from "../utils.js";
import { mqttTopics } from "../mqtt.js";
import * as service from "../services/registration.service.js";

export default async function registerMqttHandlers(mqttClient) {
  mqttClient.subscribeAsync(mqttTopics.removeMeet);

  mqttClient.on("message", async (topic, message) => {
    if (topic === mqttTopics.removeMeet) {
      handleRemoveMeet(message, topic);
    }
  });
}

async function handleRemoveMeet(message, topic) {
  const meet = JSON.parse(message.toString());
  const meetId = meet?.meetId || meet?.meet_id || meet?.id;

  logger.info(
    `Received MQTT message for removed meet: ${meetId || "unknown"} on topic ${topic}`,
  );

  if (!meetId) {
    logger.warn(
      "Could not extract meet ID from MQTT message:",
      message.toString(),
    );
    return;
  }

  service
    .removeByMeetId(meetId)
    .then(() => {
      logger.info(`Removed registrations for meet ID ${meetId}`);
    })
    .catch((err) => {
      logger.error(`Error removing registrations for meet ID ${meetId}:`, err);
    });
}

export async function handleCancelMeet(message, topic) {
  const meet = JSON.parse(message.toString());
  const meetId = meet?.meetId || meet?.meet_id || meet?.id;

  logger.info(
    `Received MQTT message for cancelled meet: ${meetId || "unknown"} on topic ${topic}`,
  );

  if (!meetId) {
    logger.warn(
      "Could not extract meet ID from MQTT message:",
      message.toString(),
    );
    return;
  }

  service
    .cancelByMeetId(meetId)
    .then(() => {
      logger.info(`Cancelled registrations for meet ID ${meetId}`);
    })
    .catch((err) => {
      logger.error(
        `Error cancelling registrations for meet ID ${meetId}:`,
        err,
      );
    });
}
