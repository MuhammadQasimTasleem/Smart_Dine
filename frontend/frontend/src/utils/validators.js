const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
    return password.length >= 6; // Password must be at least 6 characters long
};

const validateRequired = (value) => {
    return value.trim() !== ''; // Value must not be empty
};

const validatePhoneNumber = (phone) => {
    const re = /^\d{10}$/; // Validates a 10-digit phone number
    return re.test(String(phone));
};

export { validateEmail, validatePassword, validateRequired, validatePhoneNumber };