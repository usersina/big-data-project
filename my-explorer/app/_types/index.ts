export interface Transaction {
  transaction_id: string
  amount: number
  product_id: number
  timestamp: string
  user_id: number
}

export interface DashboardProps {
  transactions: Transaction[]
  isCached?: boolean
}
