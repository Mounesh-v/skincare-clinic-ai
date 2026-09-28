import Register from "../models/Register.js";

// @desc    Get all saved addresses
// @route   GET /api/addresses
// @access  Private
export const getAddresses = async (req, res) => {
  try {
    const user = await Register.findById(req.user.id).select("savedAddresses");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user.savedAddresses || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const { label, fullName, phone, address, city, state, pincode, isDefault } = req.body;

    if (!fullName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: "All address fields are required" });
    }

    const user = await Register.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.savedAddresses.forEach((addr) => (addr.isDefault = false));
    }

    // If it's the first address, make it default
    const isFirst = user.savedAddresses.length === 0;

    user.savedAddresses.push({
      label: label || "Home",
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault: isDefault || isFirst,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added",
      data: user.savedAddresses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an address
// @route   PUT /api/addresses/:addressId
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const user = await Register.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addr = user.savedAddresses.id(req.params.addressId);
    if (!addr) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const { label, fullName, phone, address, city, state, pincode, isDefault } = req.body;

    if (label !== undefined) addr.label = label;
    if (fullName !== undefined) addr.fullName = fullName;
    if (phone !== undefined) addr.phone = phone;
    if (address !== undefined) addr.address = address;
    if (city !== undefined) addr.city = city;
    if (state !== undefined) addr.state = state;
    if (pincode !== undefined) addr.pincode = pincode;

    if (isDefault) {
      user.savedAddresses.forEach((a) => (a.isDefault = false));
      addr.isDefault = true;
    }

    await user.save();

    res.status(200).json({ success: true, message: "Address updated", data: user.savedAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:addressId
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const user = await Register.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addr = user.savedAddresses.id(req.params.addressId);
    if (!addr) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const wasDefault = addr.isDefault;
    user.savedAddresses.pull(req.params.addressId);

    // If deleted address was default, make the first remaining one default
    if (wasDefault && user.savedAddresses.length > 0) {
      user.savedAddresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({ success: true, message: "Address deleted", data: user.savedAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set default address
// @route   PUT /api/addresses/:addressId/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    const user = await Register.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addr = user.savedAddresses.id(req.params.addressId);
    if (!addr) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    user.savedAddresses.forEach((a) => (a.isDefault = false));
    addr.isDefault = true;

    await user.save();

    res.status(200).json({ success: true, message: "Default address set", data: user.savedAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
