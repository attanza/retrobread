import { Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';

class MqttHandler {
  mqttClient: any;
  host: string;
  username: string;
  password: string;
  constructor() {
    this.mqttClient = null;
    this.host = process.env.MQTT_HOST;
    this.username = process.env.MQTT_USERNAME;
    this.password = process.env.MQTT_PASSWORD;
  }

  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(this.host, {
      username: this.username,
      password: this.password,
    });

    // Mqtt error calback
    this.mqttClient.on('error', err => {
      Logger.log(JSON.stringify(err), 'MQTT: ERROR');
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      Logger.log('mqtt client connected', 'Bootstrap');
    });

    // mqtt subscriptions
    this.mqttClient.subscribe('#', {
      qos: 1,
    });

    // When a message arrives, console.log it
    this.mqttClient.on('message', (topic, message) => {
      Logger.log(topic, 'MQTT: TOPIC');
      Logger.log(message.toString(), 'MQTT: MESSAGE');
    });

    this.mqttClient.on('close', () => {
      Logger.log('mqtt client disconnected', 'Bootstrap');
    });
  }

  // Sends a mqtt message to topic: myopic
  sendMessage(topic: string, message: string) {
    try {
      this.mqttClient.publish(topic, message);
    } catch (e) {
      Logger.log(JSON.stringify(e), 'MQTT: ERROR');
    }
  }
}

export default new MqttHandler();
