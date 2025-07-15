// services/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static async get<T>(key: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      
      // Vérifier si le cache est expiré
      if (Date.now() > item.timestamp + item.ttl) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL) {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async remove(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  static async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Helper pour créer des clés de cache cohérentes
  static createKey(namespace: string, ...params: any[]): string {
    return `${namespace}:${params.join(':')}`;
  }
}

// Décorateur pour mettre en cache automatiquement
export function Cacheable(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = CacheService.createKey(
        `${target.constructor.name}:${propertyName}`,
        ...args
      );

      // Essayer de récupérer depuis le cache
      const cached = await CacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Sinon, exécuter la méthode et mettre en cache
      const result = await originalMethod.apply(this, args);
      await CacheService.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}