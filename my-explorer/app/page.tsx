import cassandra from 'cassandra-driver'

export default async function Home() {
  if (!process.env.CASSANDRA_URL) {
    return (
      <main className="flex flex-col items-center justify-center p-10 h-screen bg-gray-100">
        <h2 className="text-3xl font-bold mb-5 text-red-600 italic">Error</h2>
        <p>CASSANDRA_URL is not defined in the environment variables.</p>
      </main>
    )
  }

  // const PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider
  const client = new cassandra.Client({
    contactPoints: [process.env.CASSANDRA_URL],
    localDataCenter: 'datacenter1', // https://stackoverflow.com/a/59379008/10543130
    // authProvider: new cassandra.auth.PlainTextAuthProvider(
    //   'cassandra',
    //   'cassandra'
    // ),
    keyspace: 'cleaned_data',
  })
  const query = 'SELECT * FROM sales_analytics;'

  try {
    const result = await client.execute(query)
    console.log(result)

    return (
      <main className="flex flex-col items-center justify-center p-10 h-screen bg-gray-100">
        <h2 className="text-3xl font-bold mb-5 text-blue-600 italic">
          Sales Analytics
        </h2>
        <div className="overflow-auto h-1/2 w-full bg-white rounded-xl shadow-md">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="sticky top-0 px-4 py-2 text-blue-600 bg-white">
                  Store
                </th>
                <th className="sticky top-0 px-4 py-2 text-blue-600 bg-white">
                  Total Sales
                </th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-gray-200' : ''}
                >
                  <td className="border px-4 py-2">{row.store}</td>
                  <td className="border px-4 py-2">{row.total_sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    )
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
