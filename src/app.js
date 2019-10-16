import { resolve } from 'path'
import express from 'express'
import 'express-async-errors'
import morgan from 'morgan'
import * as Sentry from '@sentry/node'
import Youch from 'youch'

import { Database } from './database'
import routes from './routes'
import { SentryConfig } from './config/sentry'

class App {
  constructor () {
    this.server = express()

    Sentry.init(SentryConfig)

    this.middlewares()
    this.routes()
    this.exceptionHandler()
    this.notFoundedHandler()
  }

  middlewares () {
    this.server.use(Sentry.Handlers.requestHandler())
    this.server.use(express.json())
    this.server.use(morgan('dev'))
    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    )
  }

  routes () {
    this.server.use(routes)
    this.server.use(Sentry.Handlers.errorHandler())
  }

  exceptionHandler () {
    this.server.use(async (err, req, res, next) => {
      const errors = await new Youch(err, req).toJSON()

      return res.status(500).json(errors)
    })
  }

  notFoundedHandler () {
    this.server.use((req, res) => {
      return res
        .status(404)
        .json({ message: 'This route is not provided' })
    })
  }

  async start () {
    try {
      await new Database()
      await this.server.listen(3000)

      console.log('Server started on port 3000')
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }
}

export default new App()
