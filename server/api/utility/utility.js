//If the user is not logged in, forbid entry

const isLoggedIn = (req, res, next) => {
  try {
    if (req.user) {
      next()
    } else {
      res.sendStatus(401) //unauthorized entry
    }
  } catch (error) {
    console.log(error)
  }
}

//If the user is not an admin, forbid entry
const isAdmin = (req, res, next) => {
  try {
    if (req.user.isAdmin) {
      next()
    } else {
      res.sendStatus(403) //forbidden entry
    }
  } catch (error) {
    console.log(error)
  }
}

//If the user it is not an admin, or the user is not the correct user, forbid entry
const isAdminOrCorrectUser = (req, res, next) => {
  try {
    if (req.user.isAdmin || req.user.id === Number(req.params.userId)) {
      next()
    } else {
      res.sendStatus(403) //forbidden entry
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  isLoggedIn,
  isAdmin,
  isAdminOrCorrectUser
}
