import express from 'express'
import { authMiddleware} from '../middleware/authMiddleware.js'
import { me } from '../controllers/auth.controller.js'
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller.js'
const router = express.Router() 

router.get('/tasks', authMiddleware, getTasks)
router.post('/tasks', authMiddleware, createTask)
router.put('/tasks/:id', authMiddleware, updateTask)
router.delete('/tasks/:id', authMiddleware, deleteTask)
router.get("/me", authMiddleware, me);

// CRUD маршруты для задач

export default router