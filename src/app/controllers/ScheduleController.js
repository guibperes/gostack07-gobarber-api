import { Op } from 'sequelize'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

import { Appointment } from '../models/Appointment'
import { User } from '../models/User'
import { File } from '../models/File'

export class ScheduleController {
  async index (req, res) {
    const { date } = req.query

    const parsedDate = parseISO(date)

    const isProvider = await User.findOne({
      where: { id: req.user, provider: true }
    })

    if (!isProvider) {
      return res.status(401).json({ message: 'User is not a provider' })
    }

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.user,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)]
        }
      },
      order: ['date'],
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url']
            }
          ]
        }
      ]
    })

    return res.json(appointments)
  }
}
