import { Router } from 'express'

import { auth } from './middlewares/auth'
import { upload } from './config/storage'
import { UserController } from './app/controllers/UserController'
import { SessionController } from './app/controllers/SessionController'
import { FileController } from './app/controllers/FileController'
import { ProviderController } from './app/controllers/ProviderController'
import { AppointmentController } from './app/controllers/AppointmentController'
import { ScheduleController } from './app/controllers/ScheduleController'

const routes = new Router()

const userController = new UserController()
const sessionController = new SessionController()
const fileController = new FileController()
const providerController = new ProviderController()
const appointmentController = new AppointmentController()
const scheduleController = new ScheduleController()

// PUBLIC ROUTES
routes.post('/users', userController.store)
routes.post('/sessions', sessionController.store)

// PRIVATE ROUTES
routes.use(auth)
routes.put('/users', userController.update)
routes.post('/files', upload.single('file'), fileController.store)
routes.get('/providers', providerController.index)
routes.post('/appointments', appointmentController.store)
routes.get('/appointments', appointmentController.index)
routes.get('/schedules', scheduleController.index)

export default routes
