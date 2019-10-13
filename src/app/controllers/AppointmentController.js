import * as Yup from 'yup'
import { startOfHour, parseISO, isBefore } from 'date-fns'

import { Appointment } from '../models/Appointment'
import { User } from '../models/User'

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

    return res.json(appointment)
  }
}
