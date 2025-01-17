import cassandra from 'cassandra-driver'
import Dashboard from './_components/dashboard'
import { getRedisClient } from './_utils/redis'

export default async function Home() {
  const CACHE_KEY = 'ecommerce_transactions'
  const CACHE_TTL = 120 // 2 minutes

  if (!process.env.CASSANDRA_URL) {
    return (
      <main className="flex flex-col items-center justify-center p-10 h-screen bg-gray-100">
        <h2 className="text-3xl font-bold mb-5 text-red-600 italic">Error</h2>
        <p>CASSANDRA_URL is not defined in the environment variables.</p>
      </main>
    )
  }

  try {
    const redis = await getRedisClient()

    // Check cache first
    const cachedData = await redis.get(CACHE_KEY)
    if (cachedData) {
      return <Dashboard transactions={JSON.parse(cachedData)} isCached />
    }

    // If no cache, query Cassandra
    const client = new cassandra.Client({
      contactPoints: [process.env.CASSANDRA_URL],
      localDataCenter: 'datacenter1',
      keyspace: 'cleaned_data',
    })

    const result = await client.execute('SELECT * FROM ecommerce_transactions;')
    await client.shutdown()

    // Transform Cassandra rows into plain objects
    const transactions = result.rows.map((row) => ({
      transaction_id: row.transaction_id?.toString(),
      amount: Number(row.amount),
      product_id: row.product_id,
      timestamp: row.timestamp?.toISOString(),
      user_id: row.user_id,
    }))

    // Store in cache
    await redis.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(transactions))

    return <Dashboard transactions={transactions} />
  } catch (err) {
    const error = err as Error
    return (
      <main className="flex flex-col items-center justify-center p-10 h-screen bg-gray-100">
        <h2 className="text-3xl font-bold mb-5 text-red-600 italic">Error</h2>
        <p>{error.message}</p>
      </main>
    )
  }
}
