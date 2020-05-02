'use strict';

const helper        = require(__dirname + '/../helper/helper.js');
const c             = require(__dirname + '/../config/constant.js');

module.exports = (database) => {

    function add(req, res) {

        const decoded = req.get('decoded_token');
        const data = req.body;

        function _proceed() {

            const form = {
                package_id: '',
                item_count: 0
            };

            helper.validateBody(form, data, res, () => {

                data.user_id = decoded.id;

                database.connection((err, conn) => {
                    if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                    _check_if_exist(conn, data);
                });
            });
        }

        function _check_if_exist(conn, data) {

            const query = `SELECT * FROM cart c
                WHERE c.user_id = ? AND c.package_id = ?`;

            conn.query(query, [decoded.id, data.package_id], (err, rows) => {
                if (err) return helper.send400(conn, res, err, c.CART_CREATE_FAILED);

                if (rows.length > 0) {
                    _update_cart(conn, data);
                }else{
                    _create_cart(conn, data);
                }
            });
        }

        function _update_cart(conn, data) {

            const query = `UPDATE cart c SET c.item_count = ?
                WHERE c.user_id = ? AND c.package_id = ?`;

            conn.query(query, [data.item_count, data.user_id, data.package_id], (err, rows) => {
                if (err) return helper.send400(conn, res, err, c.CART_CREATE_FAILED);

                helper.send200(conn, res, null, c.CART_CREATE_SUCCESS);
            });
        }

        function _create_cart(conn, data) {

            const query = 'INSERT INTO cart SET ?';

            conn.query(query, data, (err, rows) => {
                if (err) return helper.send400(conn, res, err, c.CART_CREATE_FAILED);

                helper.send200(conn, res, null, c.CART_CREATE_SUCCESS);
            });
        }

        _proceed();
    }

    function fetch(req, res) {

        const decoded = req.get('decoded_token');

        const limit   = Number(req.query.limit) || c.LIMIT;
        const page    = (Number(req.query.page) || 1);
        const offset  = (page - 1) * limit;

        function _proceed() {

            database.connection((err, conn) => {
                if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                if (limit > 0) {
                    _get_item_count(conn);
                }else{
                    _get_all(conn);
                }
            });
        }

        function _get_item_count(conn) {

            const query = `SELECT COUNT(c.user_id) AS item_count FROM cart c
                INNER JOIN user u ON u.id = c.user_id
                INNER JOIN package p ON p.id = c.package_id
                INNER JOIN airline a ON a.id = p.airline_id
                WHERE c.user_id = ?`;

            conn.query(query, [decoded.id], (err, rows) => {
                if (err) return helper.send400(conn, res, err, c.CART_FETCH_FAILED);

                _get_items(conn, rows.length > 0 ? rows[0].item_count : 0);
            });
        }

        function _get_items(conn, item_count) {

            const data = {
                item_count: item_count,
                limit: limit,
                page: page,
                items: []
            };

            if (item_count === 0) {
                return _success_response(conn, data);
            }

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
                WHERE c.user_id = ?
                LIMIT ? OFFSET ?`;

            conn.query(query, [decoded.id, limit, offset], (err, rows) => {
                if (err) return helper.send400(conn, res, err, c.CART_FETCH_FAILED);

                data.items = rows;
                _success_response(conn, data);
            });
        }

        function _get_all(conn) {

            const query = `SELECT c.* FROM cart c
                INNER JOIN user u ON u.id = c.user_id
                INNER JOIN package p ON p.id = c.package_id
                INNER JOIN airline a ON a.id = p.airline_id
                WHERE c.user_id = ?`;

            conn.query(query, [decoded.id], (err, rows) => {
                if (err) return helper.send400(conn, res, err, c.CART_FETCH_FAILED);

                _success_response(conn, rows);
            });
        }

        function _success_response(conn, data) {

            helper.send200(conn, res, data, c.CART_FETCH_SUCCESS);
        }

        _proceed();
    }

    function remove(req, res) {

        const decoded = req.get('decoded_token');
        const pkgId = req.params.pkgId;

        function _proceed() {

            database.connection((err, conn) => {
                if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                _remove(conn);
            });
        }

        function _remove(conn) {

            const query = `DELETE FROM cart
                WHERE user_id = ? AND package_id = ?`;

            conn.query(query, [decoded.id, pkgId], (err, rows) => {
                if (err || rows.affectedRows == 0) return helper.send400(conn, res, err, c.CART_REMOVE_FAILED);

                helper.send200(conn, res, { id: pkgId }, c.CART_REMOVE_SUCCESS);
            });
        }

        _proceed();
    }

    return {
        add,
        fetch,
        remove
    }
}