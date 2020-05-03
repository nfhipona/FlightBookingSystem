'use strict';

const helper        = require(__dirname + '/../helper/helper.js');
const c             = require(__dirname + '/../config/constant.js');
const config        = require(__dirname + '/../config/config.js');

let paypal          = require('paypal-rest-sdk');
const paypalConf    = config.paypal;
const apiURL        = config.development.api;

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': paypalConf.client_id,
    'client_secret': paypalConf.secret
});

module.exports = (database) => {

    function checkout(req, res) {

        const decoded = req.get('decoded_token');
        const data = req.body;

        function _proceed() {

            const form = {
                message: ''
            };

            helper.validateBody(form, data, res, () => {

                _load_cart_items(data);
            });
        }

        function _load_cart_items(data) {

            database.connection((err, conn) => {
                if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                const fields = [
                    'c.*',
                    'u.email',
                    'u.first_name',
                    'u.last_name',
                    'p.name AS package_name',
                    'p.rate AS package_rate',
                    'p.from_address',
                    'p.to_address',
                    'a.name AS airline_name'
                ].join(', ');

                const query = `SELECT ${fields} FROM cart c
                    INNER JOIN user u ON u.id = c.user_id
                    INNER JOIN package p ON p.id = c.package_id
                    INNER JOIN airline a ON a.id = p.airline_id
                    WHERE c.user_id = ?`;

                conn.query(query, [decoded.id], (err, rows) => {
                    if (err) return helper.send400(conn, res, err, c.CART_CHECKOUT_FAILED);
                    if (rows.length == 0) return helper.send400(conn, res, { message: 'Cart is empty' }, c.CART_CHECKOUT_FAILED);
                    database.done(conn);

                    let items = [];
                    for (const item of rows) {
                        items.push({
                            name: item.package_name,
                            sku: item.package_id,
                            price: item.package_rate,
                            currency: "USD",
                            quantity: item.item_count
                        });
                    }

                    data.items = items;
                    _paypal_checkout(data);
                });
            })
        }

        function _paypal_checkout(data) {

            const items = data.items;

            let totalAmt = 0;
            for (const item of items) {
                totalAmt += Number(item.price) * Number(item.quantity);
            }

            const amount = {
                currency: 'USD',
                total: totalAmt
            };

            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": `${apiURL}/paypal/success`,
                    "cancel_url": `${apiURL}/paypal/cancel`
                },
                "transactions": [{
                    "item_list": {
                        "items": items
                    },
                    "amount": amount,
                    "description": data.message
                }]
            };

            paypal.payment.create(create_payment_json, function (err, payment) {
                if (err) {
                    helper.send400(null, res, err, c.CART_CHECKOUT_FAILED);
                } else {

                    // return helper.send200(null, res, { message: payment }, c.CART_CHECKOUT_SUCCESS); -- for testing

                    for (const link of payment.links) {
                        if (link.rel == 'approval_url') {
                            return res.redirect(link.href);
                        }
                    }
                }
            });
        }

        _proceed();
    }

    function execute(req, res) {

        const decoded = req.get('decoded_token');
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        function _proceed() {

            if (!payerId || !paymentId) return helper.send400(null, res, { message: 'Missing payment details' }, c.CART_CHECKOUT_FAILED);

            _load_cart_items();
        }

        function _load_cart_items() {

            database.transaction((err, conn) => {
                if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                const fields = [
                    'c.*',
                    'u.email',
                    'u.first_name',
                    'u.last_name',
                    'p.name AS package_name',
                    'p.rate AS package_rate',
                    'p.from_address',
                    'p.to_address',
                    'a.name AS airline_name'
                ].join(', ');

                const query = `SELECT ${fields} FROM cart c
                    INNER JOIN user u ON u.id = c.user_id
                    INNER JOIN package p ON p.id = c.package_id
                    INNER JOIN airline a ON a.id = p.airline_id
                    WHERE c.user_id = ?`;

                conn.query(query, [decoded.id], (err, rows) => {
                    if (err) return database.rollback(conn, () => {
                        helper.send400(null, res, err, c.CART_CHECKOUT_FAILED);
                    });

                    if (rows.length == 0) return database.rollback(conn, () => {
                        helper.send400(null, res, { message: 'No items to buy' }, c.CART_CHECKOUT_FAILED);
                    });

                    let items = [];
                    for (const item of rows) {
                        items.push({
                            name: item.package_name,
                            sku: item.package_id,
                            price: item.package_rate,
                            currency: "USD",
                            quantity: item.item_count
                        });
                    }

                    _construct_json(conn, items);
                });
            });
        }

        function _construct_json(conn, items) {

            let totalAmt = 0;
            for (const item of items) {
                totalAmt += Number(item.price) * Number(item.quantity);
            }

            const amount = {
                currency: 'USD',
                total: totalAmt
            };

            const payment_json = {
                "payer_id": payerId,
                "transactions": [{
                    "amount": amount
                }]
            };

            _audit(conn, payment_json)
        }

        function _audit(conn, payment_json) {

            const message = `${decoded.email} has made a purchase`;
            const query = 'CALL LogUser(?, ?)';

            conn.query(query, [decoded.id, message], (err, rows) => {
                if (err) return database.rollback(conn, () => {
                    helper.send400(null, res, err, c.CART_CHECKOUT_FAILED);
                });

                _clear_cart(conn, payment_json);
            });
        }

        function _clear_cart(conn, payment_json) {

            const query = `DELETE FROM cart
                WHERE user_id = ?`;

            conn.query(query, [decoded.id], (err, rows) => {
                if (err) return database.rollback(conn, () => {
                    helper.send400(null, res, err, c.CART_CHECKOUT_FAILED);
                });

                _execute_payment(conn, payment_json);
            });
        }

        function _execute_payment(conn, payment_json) {

            paypal.payment.execute(paymentId, payment_json, function (err, payment) {
                if (err) return database.rollback(conn, () => {
                    helper.send400(null, res, err, c.CART_CHECKOUT_FAILED);
                });

                database.commit(conn, err => {
                    if (err) return helper.send400(null, res, err, c.CART_CHECKOUT_FAILED);

                    helper.send200(null, res, { message: payment }, c.CART_CHECKOUT_SUCCESS);
                });
            });
        }

        _proceed();
    }

    function cancel(req, res) {

        function _proceed() {

            helper.send400(null, res, { message: 'Canceled payment' }, c.CART_CHECKOUT_FAILED);
        }

        _proceed();
    }

    return {
        checkout,
        execute,
        cancel
    }
}