import { Router } from 'express'

import { UserController } from './app/controllers/UserController'
import { SessionController } from './app/controllers/SessionController'

const routes = new Router()

const userController = new UserController()
const sessionController = new SessionController()

routes.post('/users', userController.store)
routes.post('/sessions', sessionController.store)

export default routes
