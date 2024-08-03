import express from 'express'
import { register, login, logout, refreshToken ,confirmEmail} from '../controllers/user.controller'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/refresh-token', refreshToken)
router.get('/confirm-email', confirmEmail)

export default router