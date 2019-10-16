import * as Yup from 'yup'
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import Queue from '../../lib/Queue'
import { Appointment } from '../models/Appointment'
import { User } from '../models/User'
import { File } from '../models/File'
import { Notification } from '../schemas/Notification'
import CancellationMail from '../jobs/CancellationMail'

class AppointmentController {
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
      attributes: ['id', 'date', 'past', 'cancelable'],
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

  async delete (req, res) {
    const { id } = req.params
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name']
        }
      ]
    })

    if (appointment.canceled_at !== null) {
      return res.status(401).json({
        message: 'This appointment is already canceled'
      })
    }

    if (appointment.user_id !== req.user) {
      return res.status(401).json({
        message: "You don't have permission to cancel this appointment"
      })
    }

    const dateMinusTwoHours = subHours(appointment.date, 2)

    if (isBefore(dateMinusTwoHours, Date.now())) {
      return res.status(401).json({
        message: 'You can only cancel appointments 2 hours in advance'
      })
    }

    appointment.canceled_at = Date.now()

    const { user, provider, date } = appointment

    await Queue.add(CancellationMail.key, {
      user,
      provider,
      date
    })

    await appointment.save()

    return res.json(appointment)
  }
}

export default new AppointmentController()
