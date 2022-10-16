const amqplib = require('amqplib');
const { rabbitMq } = require('../../utils/config');

const ProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await amqplib.connect(rabbitMq.server);

    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;
