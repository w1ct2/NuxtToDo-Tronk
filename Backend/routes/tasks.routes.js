import express from 'express'
import { authMiddleware} from '../middleware/authMiddleware.js'
import { me } from '../controllers/auth.controller.js'
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller.js'
const router = express.Router() 

router.get('/tasks', getTasks)
router.post('/tasks', createTask)
router.put('/tasks/:id', updateTask)
router.delete('/tasks/:id', deleteTask)
router.get("/me", authMiddleware, me);

// CRUD маршруты для задач

export default router