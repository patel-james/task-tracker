import jwt, {JwtPayload} from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export type AuthRequest = Request & {
    user?: string | JwtPayload
}

export const authUser = async (req: AuthRequest,res: Response, next: NextFunction) => {
    try{
        const authHeader = req.headers.authorization

        if(!authHeader) {
            return res.status(400).json({message: "JWT token not provided"})
        }

        const jwtToken = authHeader.split(" ")[1]

        const secretKey = process.env.JWT_SECRET_KEY

        if(!secretKey){
            return res.status(400).json({message: "JWT secret key not found"})
        }

        const decoded = jwt.verify(jwtToken, secretKey)

        req.user = decoded

        next()

    } catch (err) {
        console.log(err)
        return res.status(401).json({ message: 'Invalid or expired token' })

        
    }
}