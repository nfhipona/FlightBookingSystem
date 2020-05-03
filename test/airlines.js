'use strict';

const h                             =   require(__dirname + '/../helper/helper.js');
const { api, expect, headers, t }   =   require(__dirname + '/base.js');

describe('AIRLINE ENDPOINT UNIT TEST', () => {

    let token;
    it('POST /users/signin -- sign-in and get user token', done => {

        api
        .post('/users/signin')
        .set(headers)
        .send({
            "email": "nferocious76@gmail.com",
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

    it('POST /airlines -- create an airline', done => {

        let airCode = `${h.randChar(4)}`;

        api
        .post('/airlines')
        .set(headers)
        .set(t(token))
        .send({
            "name": `Airline ${airCode}`
        })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);

            expect(res.body.success).to.be.true;

            done();
        });
    });

    it('GET /airlines -- get list of airlines', done => {

        api
        .get('/airlines')
        .set(headers)
        .set(t(token))
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);

            expect(res.body.success).to.be.true;

            const data = res.body.data;
            expect(data).to.have.lengthOf.above(0);

            done();
        });
    });

    it('GET /airlines?limit=5 -- get list of airlines with limit', done => {

        api
        .get('/airlines?limit=5')
        .set(headers)
        .set(t(token))
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);

            expect(res.body.success).to.be.true;

            const data = res.body.data;
            data.should.have.property('item_count');
            data.should.have.property('limit');
            data.should.have.property('page');
            data.should.have.property('items');

            const items = data.items;
            expect(items).to.have.lengthOf.above(0);

            done();
        });
    });
});