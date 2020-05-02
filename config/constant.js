'use strict';

exports.LIMIT = 0;

/** PERMISSION **/
exports.PERMISSION_DENIED           = 'Permission denied';
exports.UNAUTHORIZED_REQUEST        = 'Unauthorized request';
exports.SERVER_ERROR                = 'Server error';
exports.DATABASE_CONN_ERROR         = 'Connection error';
exports.SERVICE_UNAVAILABLE         = 'Service unavailable';
exports.FORBIDDEN_REQUEST           = 'Forbidden request';
exports.SERVER_MAINTENANCE          = 'Maintenance: Server is undergoing service upgrade. Please return later';


/** USER */
exports.USER_SIGNIN_FAILED          = 'Invalid email and/or password';
exports.USER_SIGNIN_SUCCESS         = 'Signed in success';
exports.USER_SIGNED_OUT             = 'You have logged out';
exports.USER_CREATE_FAILED          = 'Could not create user';
exports.USER_CREATE_SUCCESS         = 'User created';

/** AIRLINE */
exports.AIRLINE_CREATE_FAILED       = 'Could not create airline information';
exports.AIRLINE_CREATE_SUCCESS      = 'Airline information created';
exports.AIRLINE_FETCH_FAILED        = 'Could not fetch airline information';
exports.AIRLINE_FETCH_SUCCESS       = 'Airline information fetched';

/** PACKAGE */
exports.PACKAGE_CREATE_FAILED       = 'Could not create package information';
exports.PACKAGE_CREATE_SUCCESS      = 'Package information created';
exports.PACKAGE_FETCH_FAILED        = 'Could not fetch package information';
exports.PACKAGE_FETCH_SUCCESS       = 'Package information fetched';

/** CART */
exports.CART_CREATE_FAILED          = 'Could not add item to cart';
exports.CART_CREATE_SUCCESS         = 'Item added to cart';
exports.CART_FETCH_FAILED           = 'Could not fetch cart items';
exports.CART_FETCH_SUCCESS          = 'Cart items fetched';
exports.CART_REMOVE_FAILED          = 'Could not remove cart items';
exports.CART_REMOVE_SUCCESS         = 'Cart items removed';
exports.CART_CHECKOUT_FAILED        = 'Checkout failed';
exports.CART_CHECKOUT_SUCCESS       = 'Checkout success';

/** PAYPAL */
exports.PAYPAL_GEN_TOKEN_FAILED     = 'Could not generate token';
exports.PAYPAL_GEN_TOKEN_SUCCESS    = 'Token generated';