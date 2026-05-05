const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('API Health Check', () => {
  it('should return 200 and success message on /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'InvenTrack API is running');
  });

  // Clean up mongoose connections if they are established during app initialization
  afterAll(async () => {
    await mongoose.connection.close();
  });
});
