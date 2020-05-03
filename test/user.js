'use strict';

const h                             =   require(__dirname + '/../helper/helper.js');
const { api, expect, headers, t }   =   require(__dirname + '/base.js');

describe('USERS ENDPOINT UNIT TEST', () => {

    let email;
    it('POST /users/signup -- sign-up to create an account', done => {

        email = `test.${h.randString(8)}@gmail.com`;

        api
        .post('/users/signup')
        .set(headers)
        .send({
            "role_id": "be72f6c2-8c47-11ea-b57f-acde48001122",
            "email": email,
            "password": "1234",
            "first_name": "neil francis",
            "last_name": "hipona"
        })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);

            expect(res.body.success).to.be.true;
            const data = res.body.data;

            data.should.have.property('email');

            done();
        });
    });

    let token;

    it('POST /users/signin -- sign-in and get user token', done => {

        api
        .post('/users/signin')
        .set(headers)
        .send({
            "email": email,
            "password": "1234"
        })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);

            expect(res.body.success).to.be.true;

            const data = res.body.data;
            data.should.have.property('user');
            data.should.have.property('token_data');

            const token_data = data.token_data;
            token = token_data.token;

            done();
        });
    });

    it('POST /users/signout -- logout and clear token', done => {

        api
        .post('/users/signout')
        .set(t(token))
        .set(headers)
        .send()
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);

            expect(res.body.success).to.be.true;

            done();
        });
    });
});

