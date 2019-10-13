import { resolve } from 'path'
import express from 'express'
import morgan from 'morgan'

import { Database } from './database'
import routes from './routes'

export class App {
  constructor () {
    this.server = express()

    this.middlewares()
    this.routes()
  }

  middlewares () {
    this.server.use(express.json())
    this.server.use(morgan('dev'))
    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    )
  }

  routes () {
    this.server.use(routes)
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
