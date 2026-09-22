import type { CachePort } from '../../domain/ports/cache.port.js';
export declare class InMemoryCacheAdapter implements CachePort {
    private readonly store;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSec: number): Promise<void>;
}
