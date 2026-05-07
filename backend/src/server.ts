import 'dotenv/config'
import express, {Request, Response} from 'express'
const app = express()
const PORT: number = Number(process.env.PORT) || 8000

app.use(express.json())

app.get('/test', (req: Request, res: Response) => {
    res.status(200).send("task tracker api is running ;)")
})

app.listen(PORT, () => {
    console.log(`The app is running on http://localhost:${PORT}`)
})
