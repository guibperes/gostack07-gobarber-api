import { Router } from 'express'

import { auth } from './middlewares/auth'
import { notFounded } from './middlewares/notFounded'
import { upload } from './config/storage'
import { UserController } from './app/controllers/UserController'
import { SessionController } from './app/controllers/SessionController'
import { FileController } from './app/controllers/FileController'
import { ProviderController } from './app/controllers/ProviderController'
import { AppointmentController } from './app/controllers/AppointmentController'
import { ScheduleController } from './app/controllers/ScheduleController'
import { NotificationController } from './app/controllers/NotificationController'

const routes = new Router()

const userController = new UserController()
const sessionController = new SessionController()
const fileController = new FileController()
const providerController = new ProviderController()
const appointmentController = new AppointmentController()
const scheduleController = new ScheduleController()
const notificationController = new NotificationController()

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

routes.get('/notifications', notificationController.index)
routes.put('/notifications/:id', notificationController.update)

routes.use('*', notFounded)

export default routes
