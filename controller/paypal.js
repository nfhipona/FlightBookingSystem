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
                items: [
                    {
                        name: "",
                        sku: "",
                        price: 0.0,
                        currency: "", // USD
                        quantity: 1
                    }
                ],
                currency: "", // USD
                message: ''
            };

            helper.validateBody(form, data, res, () => {

                _paypal_checkout(data);
            });
        }

        function _paypal_checkout(data) {

            const items = data.items;

            let totalAmt = 0;
            for (const item of items) {
                totalAmt += Number(item.price) * Number(item.quantity);
            }

            const amount = {
                currency: data.currency,
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

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
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

        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        function _proceed() {

            const payment_json = {
                "payer_id": payerId,
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": "1.00"
                    }
                }]
            };

            _execute_payment(payment_json)
        }

        function _execute_payment(payment_json) {

            paypal.payment.execute(paymentId, payment_json, function (error, payment) {
                if (error) {
                    helper.send400(null, res, error, c.CART_CHECKOUT_FAILED);
                } else {
                    helper.send200(null, res, { message: payment }, c.CART_CHECKOUT_SUCCESS);
                }
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