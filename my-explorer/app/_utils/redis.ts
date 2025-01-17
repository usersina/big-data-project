import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

redisClient.on('error', (err) => console.error('Redis Client Error', err))

export const getRedisClient = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect()
  }
  return redisClient
}
