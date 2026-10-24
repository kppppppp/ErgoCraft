import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';

test('Health Check Endpoint returns status healthy', async (t) => {
  await connectDB();

  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/v1/health`);
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.status, 'healthy');
    assert.ok(json.data.uptime >= 0);
  } finally {
    server.close();
    await closeDB();
  }
});
