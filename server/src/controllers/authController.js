const authService = require('../services/authService');

const isProduction = process.env.NODE_ENV === 'production';

// Cookie options helper
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: maxAgeMs,
  path: '/',
});

/**
 * Register Customer Controller
 */
const register = async (req, res, next) => {
  try {
    const { user, tokens } = await authService.register(req.body);

    // Set secure HTTP-only cookies
    res.cookie('access_token', tokens.accessToken, getCookieOptions(15 * 60 * 1000)); // 15 min
    res.cookie('refresh_token', tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully! Welcome to Swarada Saree Center.',
      data: { user, accessToken: tokens.accessToken },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login Controller (Customer or Admin)
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(email, password);

    // Set secure HTTP-only cookies
    res.cookie('access_token', tokens.accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('refresh_token', tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      data: { user, accessToken: tokens.accessToken },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Refresh Token Controller
 */
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token || req.body.refreshToken;
    const { user, tokens } = await authService.refresh(refreshToken);

    res.cookie('access_token', tokens.accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('refresh_token', tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    res.status(200).json({
      status: 'success',
      data: { user, accessToken: tokens.accessToken },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout Controller
 */
const logout = async (req, res) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
};

/**
 * Get Current User Profile Controller
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Profile Controller
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Change Password Controller
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
