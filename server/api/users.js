const router = require('express').Router()
const {User} = require('../db/models')
module.exports = router

const {isAdmin, isAdminOrCorrectUser} = require('./utility/utility')

router.get('/', isAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll({
      /* explicitly select only the id and email fields - even though
      users' passwords are encrypted, it won't help if we just
      send everything to anyone who asks!
      attributes: ['id', 'email', 'firstName', 'lastName']*/
    })
    res.json(users)
  } catch (err) {
    next(err)
  }
})

router.get('/:userId', isAdmin, async (req, res, next) => {
  try {
    console.log('HERE')
    const user = await User.findByPk(req.params.userId)
    res.json(user)
  } catch (err) {
    console.log('the error is in the api route')
    next(err)
  }
})

router.put('/:id', isAdminOrCorrectUser, async (req, res, next) => {
  try {
    const [AffectedRow, updatedUser] = await User.update(
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        isAdmin: req.body.isAdmin,
      },
      {
        where: {id: req.params.id},
        returning: true,
        plain: true,
      }
    )
    res.json(updatedUser)
  } catch (error) {
    next(error)
  }
})
