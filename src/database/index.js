import Sequelize from 'sequelize'
import mongoose from 'mongoose'

import { MONGO_URL } from '../config/env'
import dbConfig from '../config/database'
import { User } from '../app/models/User'
import { File } from '../app/models/File'
import { Appointment } from '../app/models/Appointment'

export class Database {
  constructor () {
    this.models = [
      User,
      File,
      Appointment
    ]

    this.init()
    this.mongo()
  }

  init () {
    this.connection = new Sequelize(dbConfig)

    this.models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models))
  }

  mongo () {
    this.mongoConnection = mongoose.connect(
      MONGO_URL,
      {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      }
    )
  }
}
