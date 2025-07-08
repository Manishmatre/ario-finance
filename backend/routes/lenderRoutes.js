const express = require('express');
const router = express.Router();
const { 
  getAllLenders,
  createLender,
  getLender,
  updateLender,
  deleteLender
} = require('../controllers/lenderController');

router.route('/')
  .get(getAllLenders)
  .post(createLender);

router.route('/:id')
  .get(getLender)
  .put(updateLender)
  .delete(deleteLender);

module.exports = router;
