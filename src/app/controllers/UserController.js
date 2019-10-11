import { User } from '../models/User'

export class UserController {
  async store (req, res) {
    const { email: emailSended } = req.body

    const userExists = await User.findOne({ where: { email: emailSended } })

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists'
      })
    }

    const { id, name, email, provider } = await User.create(req.body)

    return res.json({
      id,
      name,
      email,
      provider
    })
  }
}
