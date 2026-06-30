import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, incrementRateLimit, resetRateLimit } from '../../lib/rate-limit';
import { redis } from '../../lib/redis';

vi.mock('../../lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    eval: vi.fn(),
  },
}));

describe('rate-limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('returns limited: false if no attempts exist', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      const result = await checkRateLimit('test@example.com');
      expect(result.limited).toBe(false);
      expect(redis.get).toHaveBeenCalledWith('auth:fail:test@example.com');
    });

    it('returns limited: true if attempts exceed limit', async () => {
      vi.mocked(redis.get).mockResolvedValue('5'); // Limit is 5
      const result = await checkRateLimit('test@example.com');
      expect(result.limited).toBe(true);
    });
  });

  describe('incrementRateLimit', () => {
    it('increments counter using eval', async () => {
      vi.mocked(redis.eval).mockResolvedValue(1);
      await incrementRateLimit('test@example.com');
      expect(redis.eval).toHaveBeenCalled();
    });
  });

  describe('resetRateLimit', () => {
    it('deletes the redis key', async () => {
      await resetRateLimit('test@example.com');
      expect(redis.del).toHaveBeenCalledWith('auth:fail:test@example.com');
    });
  });
});
