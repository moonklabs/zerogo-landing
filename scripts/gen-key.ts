/**
 * API 키 발급 스크립트
 *
 * 사용법:
 *   npx tsx scripts/gen-key.ts [name]
 *
 * 출력:
 *   - 평문 키 (에이전트에게 전달)
 *   - SHA-256 해시 (wrangler secret의 API_KEYS_JSON 배열에 추가)
 *
 * 키 추가 절차:
 *   1. 이 스크립트 실행 → 해시 복사
 *   2. cd cloudflare-workers/content-api
 *   3. wrangler secret put API_KEYS_JSON
 *      (기존 배열에 새 해시 추가: ["기존해시", "새해시"])
 */

import crypto from 'crypto';

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `zgo_${crypto.randomBytes(24).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

const name = process.argv[2] ?? 'agent';
const { key, hash, prefix } = generateApiKey();

console.log('');
console.log('┌─ 새 API 키 발급 ──────────────────────────────────────────────────┐');
console.log(`│  이름:   ${name}`);
console.log(`│  프리픽스: ${prefix}...`);
console.log('└──────────────────────────────────────────────────────────────────┘');
console.log('');
console.log('▶ 평문 키 (에이전트에게 전달):');
console.log(`  ${key}`);
console.log('');
console.log('▶ SHA-256 해시 (API_KEYS_JSON 배열에 추가):');
console.log(`  ${hash}`);
console.log('');
console.log('▶ wrangler secret 업데이트 방법:');
console.log('  cd cloudflare-workers/content-api');
console.log('  # 기존 값 확인 후 배열에 해시를 추가해서 입력:');
console.log(`  wrangler secret put API_KEYS_JSON`);
console.log(`  # 입력값 예시: ["${hash}"]`);
console.log('');
