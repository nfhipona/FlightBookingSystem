'use strict';

const h                             =   require(__dirname + '/../helper/helper.js');
const { api, expect, headers, t }   =   require(__dirname + '/base.js');

describe('PACKGAGE ENDPOINT UNIT TEST', () => {

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

    let airId;
    it('GET /airlines?limit=1 -- get an airline to have a package', done => {

        api
        .get('/airlines?limit=1')
        .set(headers)
        .set(t(token))
        .expect(200)
        .end((err, res) => {
           if (err) return done(err);

            expect(res.body.success).to.be.true;

            const data = res.body.data;
            data.should.have.property('items');

            const items = data.items;
            expect(items).to.have.lengthOf.above(0);

            const item = items[0];
            airId = item.id;

            done();
        });
    });

    it('POST /packages -- create a package', done => {

        let promoId = `${h.randChar(4)}`;
        let rate = `${h.randNumber(5)}`;

        api
        .post('/packages')
        .set(headers)
        .set(t(token))
        .send({
            "airline_id": airId,
            "name": `Winter Promo ${promoId}`,
            "rate": rate,
            "from_address": "Manila",
            "to_address": "Tokyo"
        })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);

            expect(res.body.success).to.be.true;

            done();
        });
    });

    it('GET /packages -- get packages', done => {

        api
        .get('/packages')
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

    it('GET /packages?limit=5 -- get packages with limit', done => {

        api
        .get('/packages?limit=5')
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