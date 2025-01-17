'use client'

import React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Transaction } from '../_types'

interface StatCardProps {
  title: string
  value: string | number
  className?: string
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  className = '',
}) => (
  <div className={`bg-white rounded-xl shadow-md p-4 ${className}`}>
    <div className="text-sm font-medium text-gray-500">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
)

const TransactionsTable = ({
  transactions = [],
}: {
  transactions: Transaction[]
}) => {
  if (transactions.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl shadow-md p-4 text-center text-gray-500">
        No transactions available
      </div>
    )
  }

  return (
    <div className="overflow-auto h-64 w-full bg-white rounded-xl shadow-md">
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="sticky top-0 px-4 py-2 text-blue-600 bg-white">
              Time
            </th>
            <th className="sticky top-0 px-4 py-2 text-blue-600 bg-white">
              Product ID
            </th>
            <th className="sticky top-0 px-4 py-2 text-blue-600 bg-white">
              Amount
            </th>
            <th className="sticky top-0 px-4 py-2 text-blue-600 bg-white">
              User ID
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.transaction_id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">
                {new Date(tx.timestamp).toLocaleString()}
              </td>
              <td className="border px-4 py-2">{tx.product_id}</td>
              <td className="border px-4 py-2">
                ${Number(tx.amount).toFixed(2)}
              </td>
              <td className="border px-4 py-2">{tx.user_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TransactionChart = ({
  transactions = [],
}: {
  transactions: Transaction[]
}) => {
  if (transactions.length === 0) {
    return (
      <div className="w-full h-64 bg-white rounded-xl shadow-md p-4 text-center text-gray-500">
        No data available for chart
      </div>
    )
  }

  const sortedData = [...transactions]
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .map((tx) => ({
      time: new Date(tx.timestamp).toLocaleString(),
      amount: Number(tx.amount),
    }))

  return (
    <div className="w-full h-64 bg-white rounded-xl shadow-md p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#3b82f6"
            name="Transaction Amount"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const Dashboard = ({ transactions = [] }: { transactions: Transaction[] }) => {
  const stats = React.useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalTransactions: 0,
        averageAmount: '0.00',
        totalAmount: '0.00',
        uniqueUsers: 0,
      }
    }

    const total = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0)
    return {
      totalTransactions: transactions.length,
      averageAmount: (total / transactions.length).toFixed(2),
      totalAmount: total.toFixed(2),
      uniqueUsers: new Set(transactions.map((tx) => tx.user_id)).size,
    }
  }, [transactions])

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">
        E-Commerce Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Transactions" value={stats.totalTransactions} />
        <StatCard title="Average Amount" value={`$${stats.averageAmount}`} />
        <StatCard title="Total Revenue" value={`$${stats.totalAmount}`} />
        <StatCard title="Unique Users" value={stats.uniqueUsers} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Transaction Trend</h2>
        <TransactionChart transactions={transactions} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <TransactionsTable transactions={transactions} />
      </div>
    </main>
  )
}

export default Dashboard
