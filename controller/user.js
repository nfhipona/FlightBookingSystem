'use strict';

const helper        = require(__dirname + '/../helper/helper.js');
const c             = require(__dirname + '/../config/constant.js');
const config        = require(__dirname + '/../config/config.js');
const util          = require(__dirname + '/../lib/util.js');

// For encrypting and decrypting password
const bcrypt = require('bcrypt');

module.exports = (database, auth) => {


}

/**
 * @param from email sender
 * @param to email recipient
 * @param subject email subject
 * @param html email body
 */
exports._create_mail_options = (from, to, subject, html) => {

    const mail_options = {
        from, to, subject, html
    };

    return mail_options;
}

exports._encrypt_password = (password, next) => {

    bcrypt.genSalt(bcryptConf.rounds, (err, salt) => {
        if (err) { return next(err, null); }

        bcrypt.hash(password, salt, (err, hash) => {
            if (err) { return next(err, null); }

            next(null, hash);
        });
    });
}