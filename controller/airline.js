'use strict';

const helper        = require(__dirname + '/../helper/helper.js');
const c             = require(__dirname + '/../config/constant.js');

module.exports = (database) => {

    function create(req, res) {

        const data = req.body;

        function _proceed() {

            const form = {
                name: ''
            };

            helper.validateBody(form, data, res, () => {

                database.connection((err, conn) => {
                    if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                    _create_airline(conn, data);
                });
            });
        }

        function _create_airline(conn, data) {

            const query = 'INSERT INTO airline SET ?';

            conn.query(query, [data], (err, rows) => {
                if (err) return helper.send400(conn, res, err, c.AIRLINE_CREATE_FAILED);

                helper.send200(conn, res, null, c.AIRLINE_CREATE_SUCCESS);
                // _load_airline(conn, rows.insertId);
            });
        }

        /*function _load_airline(conn, id) {

            const query = `SELECT * FROM airline
                WHERE id = ?`

            conn.query(query, [id], (err, rows) => {
                if (err || rows.length == 0) return helper.send400(conn, res, err, c.AIRLINE_CREATE_FAILED);

                helper.send200(conn, res, rows, c.AIRLINE_CREATE_SUCCESS);
            });
        }*/

        _proceed();
    }

    function fetch(req, res) {

        const q = req.query.q;
        const deleted = req.query.deleted;

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

            let query = 'SELECT COUNT(a.id) AS item_count FROM airline a';
            let where = [], values = [];

            if (deleted) {
                where.push(`a.deleted = ?`);
                values.push(deleted);
            }

            if (q) {
                where.push(`LOWER(a.name) LIKE LOWER(?)`);
                values.push(`%${q}%`);
            }

            if (where.length > 0) {
                query += ` WHERE ${where.join(' AND ')}`;
            }

            conn.query(query, values, (err, rows) => {
                if (err) return helper.send400(conn, res, err, c.AIRLINE_FETCH_FAILED);

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

            let query = 'SELECT a.* FROM airline a';
            let where = [], values = [];

            if (deleted) {
                where.push(`a.deleted = ?`);
                values.push(deleted);
            }

            if (q) {
                where.push(`LOWER(a.name) LIKE LOWER(?)`);
                values.push(`%${q}%`);
            }

            if (where.length > 0) {
                query += ` WHERE ${where.join(' AND ')}`;
            }

            query += ' LIMIT ? OFFSET ?';
            values.push(limit, offset);

            conn.query(query, values, (err, rows) => {
                if (err) return helper.send400(conn, res, err, c.AIRLINE_FETCH_FAILED);

                data.items = rows;
                _success_response(conn, data);
            });
        }

        function _get_all(conn) {

            let query = 'SELECT a.* FROM airline a';
            let where = [], values = [];

            if (deleted) {
                where.push(`a.deleted = ?`);
                values.push(deleted);
            }

            if (q) {
                where.push(`LOWER(a.name) LIKE LOWER(?)`);
                values.push(`%${q}%`);
            }

            if (where.length > 0) {
                query += ` WHERE ${where.join(' AND ')}`;
            }

            conn.query(query, values, (err, rows) => {
                if (err) return helper.send400(conn, res, err, c.AIRLINE_FETCH_FAILED);

                _success_response(conn, rows);
            });
        }

        function _success_response(conn, data) {

            helper.send200(conn, res, data, c.AIRLINE_FETCH_SUCCESS);
        }

        _proceed();
    }

    return {
        create,
        fetch
    }
}