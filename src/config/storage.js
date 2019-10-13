import { extname, resolve } from 'path'
import crypto from 'crypto'
import multer from 'multer'

const storage = {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, callback) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return callback(err)

        return callback(null, res.toString('hex') + extname(file.originalname))
      })
    }
  })
}

export const upload = multer(storage)
