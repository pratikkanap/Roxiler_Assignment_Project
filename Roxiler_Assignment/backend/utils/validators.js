// utils/validators.js

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // Check length (8-16 characters)
  if (password.length < 8 || password.length > 16) {
    return false;
  }

  // Must include at least one uppercase letter and one special character
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasUpperCase && hasSpecialChar;
};

const validateName = (name) => {
  return typeof name === 'string' && name.trim().length >= 20 && name.trim().length <= 60;
};

const validateAddress = (address) => {
  return typeof address === 'string' && address.trim().length > 0 && address.length <= 400;
};

module.exports = { validatePassword, validateName, validateAddress };
