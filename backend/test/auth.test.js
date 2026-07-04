const request = require('supertest');
const { app, User } = require('../server');

describe('auth routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('registers and logs in a new user', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Asha', email: 'asha@example.com', password: 'Strong123!' });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user.email).toBe('asha@example.com');

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Cookie', registerResponse.headers['set-cookie'][0].split(';')[0]);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.email).toBe('asha@example.com');
  });
});
