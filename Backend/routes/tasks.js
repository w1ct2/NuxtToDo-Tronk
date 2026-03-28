import express from 'express'
import { authMiddleware} from '../middleware/authMiddleware.js'
import { me } from '../controllers/authController.js'
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasksController.js'
const router = express.Router() 

router.get('/tasks', getTasks)
router.post('/tasks', createTask)
router.put('/tasks/:id', updateTask)
router.delete('/tasks/:id', deleteTask)
router.get("/me", authMiddleware, me);

export default router