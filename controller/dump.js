'use strict';

const helper        = require(__dirname + '/../helper/helper.js');
const c             = require(__dirname + '/../config/constant.js');
const config        = require(__dirname + '/../config/config.js').dbConfig;

const exec          = require('child_process').exec;
const fs            = require('fs');

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

                const file = fs.createWriteStream(file_loc);

                req.pipe(file);
                helper.send200(null, res, { message: filename }, c.DUMP_SUCCESS);
            });


        }

        _proceed();
    }

    return {
        make_dump
    }
}