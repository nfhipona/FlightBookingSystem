'use strict';

const helper        = require(__dirname + '/../helper/helper.js');
const c             = require(__dirname + '/../config/constant.js');
const config        = require(__dirname + '/../config/config.js');
const util          = require(__dirname + '/../lib/util.js');

// For encrypting and decrypting password
const bcrypt        = require('bcrypt');
const bcryptConf    = config.bcryptConfig;

module.exports = (database, auth) => {

    function signin(req, res, next) {

        function _proceed() {

            const data = req.body;

            const form = {
                email: '',
                password: ''
            };

            helper.validateBody(form, data, res, () => {
                _get_user(data);
            });
        }

        function _get_user(data) {

            database.connection((err, conn) => {
                if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                const fields = [
                    'u.*',
                    'r.code AS role_code',
                    'r.name AS role_name',
                    'r.description AS role_description'
                ].join(', ');

                const where = [
                    'u.email = ?',
                    'u.activated = 1',
                    'u.deleted <> 1'
                ].join(' AND ');

                const query = `SELECT ${fields} FROM user u \
                    INNER JOIN role r ON r.id = u.role_id \
                    WHERE ${where}`;

                conn.query(query, [data.email], (err, rows, _) => {
                    if (err || rows.length === 0) return helper.send400(conn, res, err, c.USER_SIGNIN_FAILED);

                    _validate_password(conn, data, rows[0]);
                });
            });
        }

        function _validate_password(conn, data, record) {

            bcrypt.compare(data.password, record.password, (err, result) => {

                if (result) {
                    database.done(conn);
                    delete record.password;

                    _check_login_permission(record);
                } else {
                    helper.send400(conn, res, err, c.USER_SIGNIN_FAILED);
                }
            });
        }

        function _check_login_permission(record) {

            const token = _create_user_token(record, 'user_token');
            const user_data = { user: record, token_data: token };

            req.user_data = user_data;

            return next(); // proceed to login check
        }

        function _create_user_token(record, type) {

            const payload = {
                type,
                id: record.id,
                role_id: record.role_id,
                role_code: record.role_code,
                role_name: record.role_name,
                email: record.email
            }

            return auth.createToken(payload, type);
        }

        _proceed();
    }

    function signup(req, res) {

        const data = req.body;

        function _proceed() {

            const form = {
                role_id: '', // role uuid
                email: '',
                password: '',
                first_name: '',
                last_name: ''
            };

            helper.validateBody(form, data, res, () => {

                database.connection((err, conn) => {
                    if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                    _create_user(conn, data);
                });
            });
        }

        function _create_user(conn, data) {

            exports._encrypt_password(data.password, (err, hash) => {
                if (err) return helper.send400(conn, res, err, c.USER_CREATE_FAILED);

                data.activated = 1; // should not be hardcoded activation
                data.password = hash;
                const query = 'INSERT INTO user SET ?';

                conn.query(query, [data], (err, rows, _) => {
                    if (err) return helper.send400(conn, res, err, c.USER_CREATE_FAILED);

                    data.id = rows.insertId;
                    helper.send200(conn, res, data, c.USER_CREATE_SUCCESS);
                });
            });
        }

        _proceed();
    }

    function signout(req, res) {

        auth.signout(req, res);
    }

    return {
        signin,
        signup,
        signout
    }
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