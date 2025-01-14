import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

const kafka = new Kafka({
  clientId: 'custom-ts-producer',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

const createTransactionRecord = () => {
  return {
    transactionId: uuidv4(),
    userId: Math.floor(Math.random() * 1000),
    productId: Math.floor(Math.random() * 100),
    amount: (Math.random() * 100).toFixed(2),
    timestamp: new Date().toISOString(),
  };
};

const run = async () => {
  await producer.connect();

  setInterval(async () => {
    const record = createTransactionRecord();
    await producer.send({
      topic: 'ecommerce_transactions',
      messages: [
        { value: JSON.stringify(record) },
      ],
    });
    console.log(`Published: ${JSON.stringify(record)}`);
  }, 1000); // Publish a record every second
};

run().catch(console.error);
