'use strict';

                            require('chai').should();
const expect            =   require('chai').expect;
const request           =   require('supertest');
const config            =   require(__dirname + '/../config/config.js');
const apiURL            =   config.development.api;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const api               = request(apiURL); // modular

const headers           =   { 'Content-Type': 'application/json', 'Accept': 'application/json' }
const t                 =   token => { return { 'x-access-token': token } };

console.log(`test server endpoint: ${apiURL}`);
module.exports = { api, expect, headers, t };