const express = require('express');
const validate = require('../../middlewares/validate');
const emailSubscriptionValidation = require('../../modules/emailSubscription/validation');
const emailSubscriptionController = require('../../modules/emailSubscription/controller/emailSubscription.controller');

const router = express.Router();

router.post('/add',validate(emailSubscriptionValidation.addEmailSubscription), emailSubscriptionController.addEmailSubscription);
router.put('/update-by-user/:id', emailSubscriptionController.updateSubscriptionByUserId);
router.post('/get-all', emailSubscriptionController.getAllSubscriptions);
router.get('/get-by-user/:id', emailSubscriptionController.getSubscriptionByUserId);

module.exports = router;