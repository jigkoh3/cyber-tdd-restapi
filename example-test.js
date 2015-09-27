var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://jsonplaceholder.typicode.com');

describe('TDD True API', function() {
    
    it('should return a 200 response', function(done) {
        api.get('/posts')
            .set('Accept', 'application/json')
            .expect(200, done);
    });
    
    it('should be an object is not null', function(done) {
        api.get('/posts')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                expect(res.body.length).to.above(0);
                done();
            })
    });
    
    it('should be an object with keys and values', function(done) {
        api.get('/posts/1')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                expect(res.body).to.have.property("userId");
                expect(res.body.userId).to.not.equal(null);
                expect(res.body.userId).to.equal(1);
                done();
            })
    });

    it('should be update with a new title', function(done) {
        api.put('/posts/1')
            .set('Accept', 'application/json')
            .send({
                "userId": 1,
                "id": 1,
                "title": "test put",
                "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
            })
            .expect(200)
            .end(function(err, res) {
                
                expect(res.body.title).to.equal('test put');
                done();
            })
    });

    it('should be create a new post', function(done) {
        api.post('/posts')
            .set('Accept', 'application/json')
            .send({
                "title": "test put",
                "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
            })
            .expect(200)
            .end(function(err, res) {
                
                expect(res.body.title).to.equal('test put');
                done();
            })
    });
});