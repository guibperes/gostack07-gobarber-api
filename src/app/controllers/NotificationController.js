import { User } from '../models/User'
import { Notification } from '../schemas/Notification'

class NotificationController {
  async index (req, res) {
    const isProvider = await User.findOne({
      where: { id: req.user, provider: true }
    })

    if (!isProvider) {
      return res.status(401).json({
        message: 'Only providers can load notifications'
      })
    }

    const notifications = await Notification
      .find({ user: req.user })
      .sort({ createdAt: -1 })
      .limit(20)

    return res.json(notifications)
  }

  async update (req, res) {
    const { id } = req.params

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    )

    return res.json(notification)
  }
}

export default new NotificationController()
