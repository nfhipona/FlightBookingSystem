'use strict';

const h                             =   require(__dirname + '/../helper/helper.js');
const { api, expect, headers, t }   =   require(__dirname + '/base.js');

describe('PAYPAL ENDPOINT UNIT TEST', () => {

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

    let pkgId;
    it('GET /packages?limit=1 -- get a package to be added to cart', done => {

        api
        .get('/packages?limit=1')
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
            pkgId = item.id;

            done();
        });
    });

    it('POST /cart -- add item to cart', done => {

        api
        .post('/cart')
        .set(headers)
        .set(t(token))
        .send({
            "package_id": pkgId,
            "item_count": 6
        })
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);

            expect(res.body.success).to.be.true;

            done();
        });
    });

    it('POST /paypal/pay -- paypal checkout', done => {

        api
        .post('/paypal/pay')
        .set(headers)
        .set(t(token))
        .send({
            "message": "Test pay"
        })
        .expect(200)
        .end((err, res) => {
            if (err) { // 302
                res.header['location'].should.include('paypal');
                return done();
            }

            done(new Error('Should have 302'));
        });
    });

});