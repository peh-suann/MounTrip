const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())

const router = express.Router()

const users = [
  {
    sid: 1,
    firstname: '冠佑yo',
    lastname: '黃',
    gender: 'male',
    birthday: '1992-03-09T16:00:00.000Z',
    account: 'y6683',
    password: '0000',
    regist_date: '2023-02-07T16:00:00.000Z',
    mobile: '0918109551',
    address: '臺北市',
    email: 'mail72218@test.com',
    personal_id: 'M221191133',
    member_status: 1,
    display: 1,
  },
]
const JWT_SECRET = 'secret_key'

router.use((req, res, next) => {
  next()
})
router.get('/try-login', async (req, res) => {
  console.log('hello-login')
})
router.post('/', async (req, res) => {
  const { username, password } = req.body
  const user = users.find((u) => u.username === username)
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }
  const token = jwt.sign({ username, role: user.role }, JWT_SECRET)
  res.json({ token })
})

module.exports = router

// app.listen(3000, () => console.log('Server is listening on port 3000'))
