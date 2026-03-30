import logger from "../utils.js";
import { mqttTopics } from "../mqtt.js";

export async function registerMqttHandlers(mqttClient) {
  mqttClient.subscribeAsync(mqttTopics.removeMeet);

  mqttClient.on("message", async (topic, message) => {
    if (topic === mqttTopics.removeMeet) {
      handleRemoveMeet(message, topic);
    }
  });
}

export async function handleRemoveMeet(message, topic) {
  const meet = JSON.parse(message.toString());
  logger.info(
    `Received MQTT message for removed meet: ${meet.id} on topic ${topic}`,
  );
}
