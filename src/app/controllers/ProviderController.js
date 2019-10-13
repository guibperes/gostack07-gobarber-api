import { User } from '../models/User'
import { File } from '../models/File'

export class ProviderController {
  async index (req, res) {
    const providers = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url']
        }
      ]
    })

    return res.json(providers)
  }
}
