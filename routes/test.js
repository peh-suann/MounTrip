const express = require('express')
const router = express.Router()

router.use((req, res, next) => {
  next()
})

router.get('/', async (req, res) => {
  console.log('working')
})

module.exports = router
