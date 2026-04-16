import crypto from 'crypto';

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  createdAt: Date;
  lastUsedAt?: Date;
  isActive: boolean;
}

export interface ApiKeyCreate {
  name: string;
}

export interface ApiKeyWithSecret extends ApiKey {
  key: string;
}

const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/tmp/api-keys.json'
  : undefined;

function getDbPath(): string {
  if (DB_PATH) return DB_PATH;
  const { fileURLToPath } = require('url');
  const { dirname } = require('path');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return require('path').join(__dirname, '../../api-keys.json');
}

function loadKeys(): ApiKey[] {
  try {
    const fs = require('fs');
    const path = getDbPath();
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.map((k: ApiKey) => ({
        ...k,
        createdAt: new Date(k.createdAt),
        lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt) : undefined,
      }));
    }
  } catch {
    // Return empty array
  }
  return [];
}

function saveKeys(keys: ApiKey[]): void {
  const fs = require('fs');
  const path = getDbPath();
  const dir = require('path').dirname(path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path, JSON.stringify(keys, null, 2));
}

export function generateApiKey(): { key: string; keyHash: string; keyPrefix: string } {
  const key = `zgo_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  const keyPrefix = key.slice(0, 12);
  return { key, keyHash, keyPrefix };
}

export function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function validateKeyFormat(key: string): boolean {
  return key.startsWith('zgo_') && key.length === 51;
}

export async function createApiKey(name: string): Promise<ApiKeyWithSecret> {
  const { key, keyHash, keyPrefix } = generateApiKey();
  
  const apiKey: ApiKey = {
    id: crypto.randomUUID(),
    name,
    keyHash,
    keyPrefix,
    createdAt: new Date(),
    isActive: true,
  };
  
  const keys = loadKeys();
  keys.push(apiKey);
  saveKeys(keys);
  
  return { ...apiKey, key };
}

export function validateApiKey(key: string): ApiKey | null {
  if (!validateKeyFormat(key)) {
    return null;
  }
  
  const keyHash = hashKey(key);
  const keys = loadKeys();
  const apiKey = keys.find(k => k.isActive && k.keyHash === keyHash);
  
  if (apiKey) {
    apiKey.lastUsedAt = new Date();
    saveKeys(keys);
    return apiKey;
  }
  
  return null;
}

export function revokeApiKey(id: string): boolean {
  const keys = loadKeys();
  const index = keys.findIndex(k => k.id === id);
  
  if (index === -1) {
    return false;
  }
  
  keys[index].isActive = false;
  saveKeys(keys);
  return true;
}

export function listApiKeys(): Omit<ApiKey, 'keyHash'>[] {
  const keys = loadKeys();
  return keys.map(({ keyHash, ...rest }) => rest);
}

export function getApiKeyById(id: string): ApiKey | null {
  const keys = loadKeys();
  return keys.find(k => k.id === id) || null;
}