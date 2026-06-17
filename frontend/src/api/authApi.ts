import { BASE_URL, jsonHeaders } from './helpers'
import type { LoginResponse, SignupResponse } from '../types'

export const signup = async (
  name: string,
  email: string,
  password: string
): Promise<SignupResponse> => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ name, email, password }),
  })
  return res.json()
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}
