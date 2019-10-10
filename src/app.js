import express from 'express'

import routes from './routes'

export class App {
  constructor () {
    this.server = express()

    this.middlewares()
    this.routes()
  }

  middlewares () {
    this.server.use(express.json())
  }

  routes () {
    this.server.use(routes)
  }

  start () {
    this.server.listen(3000, console.log('Server started on port 3000'))
  }
}
