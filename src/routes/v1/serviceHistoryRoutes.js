const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { mongoIdValidator } = require('../../utils/validators');
const {
  getServiceHistory,
  getServiceRecord,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
} = require('../../controllers/serviceHistoryController');

// Service history for specific vehicle
router.get('/vehicles/:vehicleId/service-history', protect, getServiceHistory);
router.post('/vehicles/:vehicleId/service-history', protect, createServiceRecord);

// Individual service records
router.get('/:id', protect, mongoIdValidator, validate, getServiceRecord);
router.put('/:id', protect, mongoIdValidator, validate, updateServiceRecord);
router.delete('/:id', protect, mongoIdValidator, validate, deleteServiceRecord);

module.exports = router;
