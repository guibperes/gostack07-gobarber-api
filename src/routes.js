import { Router } from 'express'

import { auth } from './middlewares/auth'
import { upload } from './config/storage'
import { UserController } from './app/controllers/UserController'
import { SessionController } from './app/controllers/SessionController'
import { FileController } from './app/controllers/FileController'

const routes = new Router()

const userController = new UserController()
const sessionController = new SessionController()
const fileController = new FileController()

// PUBLIC ROUTES
routes.post('/users', userController.store)
routes.post('/sessions', sessionController.store)

// PRIVATE ROUTES
routes.use(auth)
routes.put('/users', userController.update)
routes.post('/files', upload.single('file'), fileController.store)

export default routes
