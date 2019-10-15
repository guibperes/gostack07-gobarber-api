import * as Yup from 'yup'
import { startOfHour, parseISO, isBefore, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Appointment } from '../models/Appointment'
import { User } from '../models/User'
import { File } from '../models/File'
import { Notification } from '../schemas/Notification'

export class AppointmentController {
  async store (req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    })

    try {
      await schema.validate(req.body)
    } catch (error) {
      return res.status(400).json(error)
    }

    const { provider_id, date } = req.body

    if (req.user === provider_id) {
      return res.status(400).json({
        message: 'You cannot create a appointment with yourself'
      })
    }

    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    })

    if (!isProvider) {
      return res
        .status(401)
        .json({ message: 'You can only create appointments with providers' })
    }

    const hourStart = startOfHour(parseISO(date))

    if (isBefore(hourStart, Date.now())) {
      return res.status(400).json({ message: 'Past dates are not permited' })
    }

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    })

    if (checkAvailability) {
      return res.status(400).json({ message: 'Appointment date is not available' })
    }

    const appointment = await Appointment.create({
      user_id: req.user,
      provider_id,
      date
    })

    const user = await User.findByPk(req.user)

    console.log(hourStart)
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM, à's' HH:mm'h'",
      { locale: ptBR }
    )

    await Notification.create({
      content: `Novo agendamento de ${user.name}, para o ${formattedDate}`,
      user: provider_id
    })

    return res.json(appointment)
  }

  async index (req, res) {
    const { page = 1 } = req.query

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.user,
        canceled_at: null
      },
      attributes: ['id', 'date'],
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
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
