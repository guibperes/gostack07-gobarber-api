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

  async update (req, res) {
    const { email, oldPassword, password } = req.body

    const user = await User.findByPk(req.user)

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } })

      if (userExists) {
        return res.status(400).json({ message: 'User already exists' })
      }
    }

    if (password) {
      if (!oldPassword || !(await user.checkPassword(oldPassword))) {
        return res.status(401).json({ message: 'Password does not match' })
      }
    }

    const { id, name, provider } = await user.update(req.body)

    return res.json({
      id,
      name,
      email,
      provider
    })
  }
}
