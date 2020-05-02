'use strict';

const helper = require(__dirname + '/../helper/helper.js');
const c = require(__dirname + '/../config/constant.js');

const braintree = require('braintree');

var gateway = braintree.connect({
    accessToken: useYourAccessToken
});

module.exports = (database) => {

    function client_token(req, res) {

        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                helper.send400(null, res, err, c.PAYPAL_GEN_TOKEN_FAILED);
            }else{
                helper.send200(null, res, { clientToken: response.clientToken }, c.PAYPAL_GEN_TOKEN_SUCCESS);
            }
        });
    }

    function checkout(res, req) {

        const decoded = req.get('decoded_token');
        const data = req.body;

        function _proceed() {

            const form = {
                amount: 0,
                nonce: '',

                shipping: {
                    firstName: '',
                    lastName: "",
                    company: "",
                    streetAddress: "",
                    extendedAddress: "",
                    locality: "",
                    region: "",
                    postalCode: "",
                    countryCodeAlpha2: ""
                },
                paypal: {
                    customField: "",
                    description: ""
                }
            };

            helper.validateBody(form, data, res, () => {

                _paypal_checkout(data);
            });
        }

        function _paypal_checkout(data) {


            var saleRequest = {
                amount: data.amount,
                merchantAccountId: "USD",
                paymentMethodNonce: data.nonce,
                orderId: "Mapped to PayPal Invoice Number",
                descriptor: {
                    name: "Descriptor displayed in customer CC statements. 22 char max"
                },
                shipping: data.shipping,
                options: {
                    paypal: data.paypal,
                    submitForSettlement: true
                }
            };

            gateway.transaction.sale(saleRequest, function (err, result) {
                if (err) {
                    helper.send400(null, res, err, c.CART_CHECKOUT_FAILED);
                } else if (result.success) {
                    helper.send200(null, res, { message: `Success! Transaction ID: ${result.transaction.id}` }, c.CART_CHECKOUT_SUCCESS);
                } else {
                    helper.send400(null, res, { message: result.message }, c.CART_CHECKOUT_FAILED);
                }
            });
        }

        _proceed();
    }

    return {
        client_token,
        checkout
    }
}