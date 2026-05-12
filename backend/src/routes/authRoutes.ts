import express from 'express'
import {signupHandler, loginHandler, myRoute} from '../controllers/authControllers.js'
import {authUser} from '../middleware/authMiddleware.js'
const router = express.Router()


router.post('/signup', signupHandler)
router.post('/login', loginHandler)
router.post('/me', authUser , myRoute)


export default router