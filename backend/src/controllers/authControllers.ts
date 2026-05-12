import pool from '../db/connection.js'
import type {ResultSetHeader, RowDataPacket} from 'mysql2'
import type {Request, Response} from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

type SignupBody = {
    name: string,
    email: string,
    password: string
}
type loginBody = {
    email: string,
    password: string
}

type UserRow = RowDataPacket & {
    id: number,
    name: string,
    email: string,
    password_hash: string
}

export const signupHandler = async (req: Request <{}, {}, SignupBody>, res: Response) => {
    try{
        const {name, email, password} = req.body

        if(!name || !email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        const password_hash: string = await bcrypt.hash(password, 10)
        
        const [results] = await pool.query<ResultSetHeader>("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", 
            [name, email, password_hash])

        return res.status(201).json({message: "User successfully created ", UserId: results.insertId})

    }
    catch(err) {
        console.log(err)
        return res.status(500).json({error: "Server side error"})
    }
}

export const loginHandler = async (req: Request <{},{} , loginBody>, res: Response) => {
    try{
        const {email, password} = req.body

        if(!email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        const [results] = await pool.query<UserRow[]>("SELECT * FROM users WHERE email = ?", [email])

        if(results.length === 0){
            return res.status(401).json({message: "Invalid Credentials"})
        }
        const user = results[0]

        const isMatch: boolean = await bcrypt.compare(password, user.password_hash)

        if(!isMatch){
            return res.status(401).json({message: "Invalid Credentials"})
        }
        const jwtSecret = process.env.JWT_SECRET_KEY

        if (!jwtSecret) {
            return res.status(500).json({ message: 'JWT secret is not configured' })
        }   

        const token = jwt.sign(
        { id: user.id, email: user.email},
        jwtSecret,
        {expiresIn: "5m"}
        )

        return res.status(200).json({message: "Welcome " + user.name, 
            token, 
            user: {
            id: user.id, name: user.name, email: user.email
        }})
        

    } 
    catch(err) {
        console.log(err)
        return res.status(500).json({error: "Server side error"})
    }
}