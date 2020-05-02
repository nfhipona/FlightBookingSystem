'use strict';

const aclJS                 = require(__dirname + '/acl.js'); // Auth - resource access

const userJS                = require(__dirname + '/../controller/user.js');
const airlineJS             = require(__dirname + '/../controller/airline.js');
const packageJS             = require(__dirname + '/../controller/package.js');

module.exports = (app, database, auth) => {


    /** ACL MATRIX */
    const a                 = aclJS(database);
    const acl               = a.acl;
    const login_check       = a.login_check;
    const is_maintenance    = a.is_maintenance;

    /** USER **/
    const user              = userJS(database, auth);

    app.post    ('/users/signin',                                   user.signin,                                    login_check('user_account', 'r')                                                                            ); // will validate if server is under maintenance
    app.post    ('/users/signup',                                   is_maintenance('user_account', 'r'),            user.signup,                                                                                                );
    app.post    ('/users/signout',                                  user.signout,                                                                                                                                               );

    /** AIRLINE */
    const airline           = airlineJS(database);

    app.post    ('/airlines',                                       auth.verifyWithType('user_token'),              acl('name_later', 'w'),                                    airline.create                                   );
    app.get     ('/airlines',                                       auth.verifyWithType('user_token'),              acl('name_later', 'r'),                                    airline.fetch                                    );

    /** PACKAGE */
    const pkg               = packageJS(database);

    app.post    ('/packages',                                       auth.verifyWithType('user_token'),              acl('name_later', 'w'),                                    pkg.create                                       );
    app.get     ('/packages',                                       auth.verifyWithType('user_token'),              acl('name_later', 'r'),                                    pkg.fetch                                        );
}