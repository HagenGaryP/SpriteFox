const router = require('express').Router();
const {Room, Frame} = require('../db/models');

// not implemented at the moment, but keeping the code for when we use a DB/APIs
router.get('/:hash', async (req, res, next) => {
  try {
    const room = await Room.findOne({
      where: {hash: req.params.hash},
      include: [{model: Frame}]
    })
    res.json(room)
  } catch (error) {
    console.log(error);
    next(error);
  }
})
