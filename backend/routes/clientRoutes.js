const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { auth } = require('../middleware/auth');
const withTenant = require('../middleware/withTenant');

router.use(auth, withTenant);

router.route('/')
  .get(clientController.listClients)
  .post(clientController.createClient);

router.route('/:id')
  .get(clientController.getClient)
  .put(clientController.updateClient)
  .delete(clientController.deleteClient);

module.exports = router; 