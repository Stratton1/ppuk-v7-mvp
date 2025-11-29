import { createRequest, createResponse } from 'node-mocks-http';
import { describe, expect, it } from 'vitest';
import { healthHandler } from '../routes/health';

describe('GET /health', () => {
  it('returns ok status', () => {
    const req = createRequest({
      method: 'GET',
      url: '/health',
    });
    const res = createResponse();

    healthHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ status: 'ok' });
  });
});
