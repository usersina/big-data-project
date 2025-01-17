import { Kafka } from 'kafkajs'
import { v4 as uuidv4 } from 'uuid'
import winston from 'winston'
import 'winston-daily-rotate-file'

// Configure logger
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
})

const kafka = new Kafka({
  clientId: 'custom-ts-producer',
  brokers: ['localhost:9092'],
})

const producer = kafka.producer()

const createTransactionRecord = () => {
  return {
    transactionId: uuidv4(),
    userId: Math.floor(Math.random() * 1000),
    productId: Math.floor(Math.random() * 100),
    amount: (Math.random() * 100).toFixed(2),
    timestamp: new Date().toISOString(),
  }
}

const run = async () => {
  try {
    await producer.connect()
    logger.info('Connected to Kafka broker')

    setInterval(async () => {
      const record = createTransactionRecord()
      try {
        await producer.send({
          topic: 'ecommerce_transactions',
          messages: [{ value: JSON.stringify(record) }],
        })
        logger.info(`Published record: ${JSON.stringify(record)}`)
      } catch (error) {
        logger.error(`Failed to publish record: ${error.message}`)
      }
    }, 1000) // Publish a record every second
  } catch (error) {
    logger.error(`Failed to connect to Kafka broker: ${error.message}`)
  }
}

run().catch((error) => logger.error(`Application error: ${error.message}`))
