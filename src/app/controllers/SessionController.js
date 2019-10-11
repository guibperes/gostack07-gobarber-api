import jwt from 'jsonwebtoken'
import * as Yup from 'yup'

import { AUTH_SECRET, EXPIRES_IN } from '../../config/auth'
import { User } from '../models/User'

export class SessionController {
  async store (req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required()
    })

    try {
      await schema.validate(req.body)
    } catch (error) {
      return res.status(400).json(error)
    }

    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({
        message: 'User not founded'
      })
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({
        message: 'Password does not match'
      })
    }

    const { id, name } = user

    const token = jwt.sign({ id }, AUTH_SECRET, {
      expiresIn: EXPIRES_IN
    })

    return res.json({
      user: {
        id,
        name,
        email
      },
      token
    })
  }
}
