import { Injectable } from '@nestjs/common';
import type { CachePort } from '../../domain/ports/cache.port.js';

interface CacheItem {
  value: string;
  expiresAt: number;
}

/**
 * ADAPTER driven — cache en RAM
 * IMPLEMENTA: CachePort
 *
 * FLUJO:
 *   UseCase  → get/set con hash sha256(tenant + prompt masked)
 *
 * Mañana: RedisCacheAdapter con GET/SETEX. Mismo puerto.
 * OJO: en varios pods esta RAM no se comparte; Redis sí.
 */
@Injectable()
export class InMemoryCacheAdapter implements CachePort {
  private readonly store = new Map<string, CacheItem>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSec: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSec * 1000,
    });
  }
}
