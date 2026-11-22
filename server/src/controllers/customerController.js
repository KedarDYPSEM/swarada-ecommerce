const customerAddressService = require('../services/customerAddressService');

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await customerAddressService.getAddresses(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { addresses },
    });
  } catch (err) {
    next(err);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const address = await customerAddressService.addAddress(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Address saved successfully.',
      data: { address },
    });
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const addresses = await customerAddressService.deleteAddress(req.user.id, req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Address deleted.',
      data: { addresses },
    });
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const addresses = await customerAddressService.updateAddress(req.user.id, req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Address updated successfully.',
      data: { addresses },
    });
  } catch (err) {
    next(err);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const addresses = await customerAddressService.setDefaultAddress(req.user.id, req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Default address updated.',
      data: { addresses },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
