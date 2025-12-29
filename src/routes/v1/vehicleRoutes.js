const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { vehicleValidator, mongoIdValidator } = require('../../utils/validators');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../../controllers/vehicleController');

router.get('/', protect, getVehicles);
router.get('/:id', protect, mongoIdValidator, validate, getVehicle);
router.post('/', protect, vehicleValidator, validate, createVehicle);
router.put('/:id', protect, mongoIdValidator, vehicleValidator, validate, updateVehicle);
router.delete('/:id', protect, mongoIdValidator, validate, deleteVehicle);

module.exports = router;
