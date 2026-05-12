import 'dotenv/config'
import express, {Request, Response} from 'express'
import pool from './db/connection.js'
import authRoutes from './routes/authRoutes.js'
const app = express()
const PORT: number = Number(process.env.PORT) || 8000

app.use(express.json())

app.get('/test', (req: Request, res: Response) => {
    res.status(200).json({message: "task tracker api is running ;)"})
})

app.get('/test-db', async (req: Request, res: Response) => {
    try{
        const [row] = await pool.query("SELECT 1 As Good")
        return res.status(200).json({Message: row})
    } catch (err){
        res.status(500).json({Message: "Failed to connect to DB"})
        console.log(err)
    }
})

app.use('/api/auth', authRoutes)


app.listen(PORT, () => {
    console.log(`The app is running on http://localhost:${PORT}`)
})
