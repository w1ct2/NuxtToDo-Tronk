import express from "express"
import cors from "cors"
import dotenv from "dotenv"

const app = express()

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use(express.json())
app.get('/', (req, res) => {
    res.send('API is running')
  })
  
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => console.log(`Server running on ${PORT}`))