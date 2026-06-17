import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import type { JwtUser } from '../utils/authTypes.js'

// Extend Express's Request type to include our decoded JWT payload.
export type AuthRequest = Request & {
  user?: JwtUser
}

export const authUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' })
    }

    // Header format: "Bearer <token>"
    const jwtToken = authHeader.split(' ')[1]

    const secretKey = process.env.JWT_SECRET_KEY

    if (!secretKey) {
      return res.status(500).json({ message: 'JWT secret key not configured' })
    }

    // Verify and cast — we know our JWT payload matches JwtUser
    const decoded = jwt.verify(jwtToken, secretKey) as JwtUser

    req.user = decoded

    next()
  } catch (err) {
    console.log(err)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}