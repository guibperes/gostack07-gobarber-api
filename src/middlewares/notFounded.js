export function notFounded (req, res) {
  return res
    .status(404)
    .json({ message: 'This route is not provided' })
}
