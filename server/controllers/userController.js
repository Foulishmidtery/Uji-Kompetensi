const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, password } = req.body;
    const updateData = { name, email, role, department };

    let user;
    if (password) {
      user = await User.findById(req.params.id).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      user.department = department || user.department;
      user.password = password;
      await user.save();
    } else {
      user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
      });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE_USER',
      target: `Mengupdate user: ${user.name}`,
      targetId: user._id
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETE_USER',
      target: `Menghapus user: ${user.name}`,
      targetId: user._id
    });

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs
// @route   GET /api/logs
exports.getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const query = {};
    if (action) query.action = action;

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};
