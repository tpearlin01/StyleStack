const User = require('../models/User');
const store = require('../data/store');
const { isMongoDBConnected } = require('../config/db');

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

    if (isMongoDBConnected()) {
      let user = await User.findOne({ email: normalizedEmail });

      // Fallback check in local store if not yet in MongoDB
      if (!user) {
        const localUser = store.findUserByEmail(normalizedEmail);
        if (localUser && localUser.password === password) {
          user = await User.create(localUser);
        }
      }

      if (!user || user.password !== password) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        throw err;
      }

      const effectiveRole = role || user.role || 'customer';
      const token = `jwt-token-${Date.now()}`;

      return res.json({
        success: true,
        token,
        user: {
          id: user.id || user._id.toString(),
          name: user.name,
          firstName: user.firstName || user.name.split(' ')[0],
          lastName: user.lastName || user.name.split(' ').slice(1).join(' '),
          email: user.email,
          role: effectiveRole,
        },
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
    const user = store.findUserByEmail(normalizedEmail);
    if (!user || user.password !== password) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

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
      source: 'local_json_fallback',
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

    const normalizedEmail = email.trim().toLowerCase();
    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Valued Customer';
    const fName = firstName || fullName.split(' ')[0];
    const lName = lastName || fullName.split(' ').slice(1).join(' ') || '';

    if (isMongoDBConnected()) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        const err = new Error('User with this email already exists');
        err.status = 400;
        throw err;
      }

      const generatedId = `usr-${Date.now()}`;
      const newUser = await User.create({
        id: generatedId,
        name: fullName,
        firstName: fName,
        lastName: lName,
        email: normalizedEmail,
        password,
        role: role === 'admin' ? 'admin' : 'customer',
      });

      // Mirror in local store
      try {
        store.registerUser({
          firstName: fName,
          lastName: lName,
          name: fullName,
          email: normalizedEmail,
          password,
          role: role || 'customer',
        });
      } catch (e) {
        // ignore
      }

      const token = `jwt-token-${Date.now()}`;

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser.id || newUser._id.toString(),
          name: newUser.name,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
        },
        source: 'mongodb',
      });
    }

    // Offline JSON Store Fallback
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
      source: 'local_json_fallback',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
};
