// The shape of the payload we encode inside the JWT when a user logs in.
// This is what req.user looks like after authMiddleware runs.
export type JwtUser = {
  id: number
  email: string
}
