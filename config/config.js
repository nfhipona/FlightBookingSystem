'use strict';

require("dotenv").config();

const fs            = require('fs');
const path          = require('path');
const helper        = require(__dirname + '/../helper/helper.js');

const env           = process.env;

exports.dbConfig = helper.parseSettingsConfig(env.DATABASE_DEV_URL);

let key, cert;
const keyFile = 'certificate.key';
const cerFile = 'certificate.crt';

try {
    key = fs.readFileSync(path.resolve(`../certificate-files/${keyFile}`));
} catch (err) {
    console.log(`Server SSL key not found: ${keyFile}`)
}

try {
    cert = fs.readFileSync(path.resolve(`../certificate-files/${cerFile}`));
} catch (err) {
    console.log(`Server SSL cert not found: ${cerFile}`)
}

exports.certificate         = { key: key, cert: cert };

exports.serverConfig        = helper.parseSettingsConfig(env.SERVER_CONFIG);
exports.jwtConfig           = helper.parseSettingsConfig(env.JWT_CONFIG);
exports.redisConfig         = helper.parseSettingsConfig(env.REDIS);

exports.development         = helper.parseSettingsConfig(env.DEVELOPMENT_ENV);

exports.bcryptConfig = {
    rounds: 10
};

exports.cors = {
    allow_credentials: true,
    hosts: [
        '127.0.0.1',
        'localhost',
        'yourwebsite.com',
    ],
    origins: [
        '127.0.0.1',
        'localhost',
        'yourwebsite.com'
    ],
    methods: [
        'DELETE',
        'PUT',
        'GET',
        'POST',
        'OPTIONS'
    ],
    headers: [
        'Content-Type',
        'Accept',
        'x-access-token',
        'Lang'
    ]
}