import { BASE_URL, authHeaders } from './helpers'
import type { DashboardData } from '../types'

export const getDashboard = async (): Promise<DashboardData> => {
  const res = await fetch(`${BASE_URL}/dashboard`, {
    headers: authHeaders(),
  })
  return res.json()
}
