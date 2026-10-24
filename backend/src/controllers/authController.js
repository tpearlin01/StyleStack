const store = require('../data/store');

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !email.trim()) {
      const err = new Error('Email is required');
      err.status = 400;
      throw err;
    }

    if (!password) {
      const err = new Error('Password is required');
      err.status = 400;
      throw err;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = store.findUserByEmail(normalizedEmail);

    if (!user || user.password !== password) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    // Role check / override if requested
    const effectiveRole = role || user.role || 'customer';
    const token = `mock-jwt-token-${Date.now()}`;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: effectiveRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, name, email, password, role } = req.body;

    if (!email || !email.trim()) {
      const err = new Error('Email is required');
      err.status = 400;
      throw err;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      const err = new Error('Please provide a valid email address');
      err.status = 400;
      throw err;
    }

    if (!password || password.length < 6) {
      const err = new Error('Password must be at least 6 characters long');
      err.status = 400;
      throw err;
    }

    const registeredUser = store.registerUser({
      firstName,
      lastName,
      name,
      email,
      password,
      role: role || 'customer',
    });

    const token = `mock-jwt-token-${Date.now()}`;

    res.status(201).json({
      success: true,
      token,
      user: {
        id: registeredUser.id,
        name: registeredUser.name,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        email: registeredUser.email,
        role: registeredUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
};
