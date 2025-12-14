
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch } from '../lib/api/client';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('apiFetch', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    // Default mock implementation
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      text: async () => JSON.stringify({ success: true }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET request should fetch data correctly', async () => {
    const response = await apiFetch('/test-get');
    
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/test-get'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      })
    );
    expect(response).toEqual({ success: true });
  });

  it('POST request should send body correctly', async () => {
    const body = { name: 'Test Item' };
    await apiFetch('/test-post', { method: 'POST', body });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/test-post'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('PUT request should update data', async () => {
    const body = { name: 'Updated Item' };
    await apiFetch('/test-put', { method: 'PUT', body });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/test-put'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(body),
      })
    );
  });

  it('DELETE request should handle 204 No Content correctly', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: 'No Content',
      text: async () => '',
      json: async () => { throw new Error('Should not be called'); },
    });

    const response = await apiFetch('/test-delete', { method: 'DELETE' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/test-delete'),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
    expect(response).toBeNull();
  });

  it('should sanitize headers', async () => {
    await apiFetch('/test-headers', {
      authToken: 'token\n',
      locale: 'en-US '
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
          'Accept-Language': 'en-US',
        }),
      })
    );
  });

  it('should handle API errors (404)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Resource not found',
    });

    await expect(apiFetch('/not-found')).rejects.toThrow('API 404: Resource not found');
  });
});
