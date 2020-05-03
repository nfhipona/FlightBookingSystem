'use strict';

const helper        = require(__dirname + '/../helper/helper.js');
const c             = require(__dirname + '/../config/constant.js');
const config        = require(__dirname + '/../config/config.js').dbConfig;

const exec          = require('child_process').exec;
const fs            = require('fs');
var mime            = require('mime');

module.exports = (database) => {

    function make_dump(req, res) {

        function _proceed() {

            const dateNow = new Date();
            const timestamp = dateNow.toISOString();
            const filename = `fbs-${timestamp}.sql`;
            const file_loc = `./dump/${filename}`;

            const sql_command = config.password.length > 0 ? `mysqldump -u ${config.user} -p${config.password} ${config.database}` : `mysqldump -u ${config.user} ${config.database}`;
            const command = `${sql_command} > ${file_loc}`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  return helper.send400(null, res, error, c.DUMP_FAILED);
                }

                const mimetype = mime.lookup(file_loc);
                res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                res.setHeader('Content-type', mimetype);

                const filestream = fs.createReadStream(file_loc);
                filestream.pipe(res);
            });
        }

        _proceed();
    }

    return {
        make_dump
    }
}