import Bee from 'bee-queue'

import { RedisConfig } from '../config/redis'
import CancellationMail from '../app/jobs/CancellationMail'

class Queue {
  constructor () {
    this.queues = {}

    this.jobs = [
      CancellationMail
    ]

    this.init()
  }

  init () {
    this.jobs.map(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, { redis: RedisConfig }),
        handle
      }
    })
  }

  add (queue, job) {
    return this.queues[queue].bee
      .createJob(job)
      .save()
  }

  processQueue () {
    this.jobs.map(job => {
      const { bee, handle } = this.queues[job.key]

      bee.process(handle)
    })
  }
}

export default new Queue()
