const request = require('supertest');
const app = require('./app');

describe('API Endpoints', () => {
  it('should get all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should create a new user', async () => {
    const res = await request(app).post('/users').send({ name: 'John Doe' });
    expect(res.statusCode).toEqual(201);
  });

  it('should get a user by ID', async () => {
    const res = await request(app).get('/users/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name');
  });

  it('should update a user by ID', async () => {
    const res = await request(app).put('/users/1').send({ name: 'Jane Doe' });
    expect(res.statusCode).toEqual(200);
  });
});
