// Shared helpers used by all API modules.

export const BASE_URL = 'http://localhost:8000/api'

// Returns headers for authenticated requests.
// The JWT token is read from localStorage each time so it always uses the latest value.
export const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
})

export const jsonHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
})
