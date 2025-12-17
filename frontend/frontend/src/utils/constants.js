// This file contains constant values used throughout the application.

export const API_BASE_URL = 'http://localhost:8000/api'; // Base URL for API calls

export const MENU_CATEGORIES = [
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
];

export const RESERVATION_TIMES = [
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
    '8:00 PM',
];

export const PAYMENT_METHODS = [
    'Credit Card',
    'Debit Card',
    'PayPal',
    'Cash',
];

export const DEFAULT_IMAGE = '/assets/images/default.png'; // Default image for menu items

export const ERROR_MESSAGES = {
    REQUIRED: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    PASSWORD_MISMATCH: 'Passwords do not match.',
};