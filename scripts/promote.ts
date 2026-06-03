/**
 * 운영(main) 승급 스크립트 — dev 전체를 main으로 fast-forward
 *
 * 사용법:
 *   npm run promote
 *   npx tsx scripts/promote.ts
 *
 * 동작:
 *   1. dev/main 최신 상태 fetch
 *   2. 이미 최신이면 안내 후 정상 종료 (멱등)
 *   3. fast-forward 가능 여부 검증 (분기 시 중단)
 *   4. main을 dev로 fast-forward push (로컬 체크아웃 없음)
 *   5. 운영 배포(deploy-amplify.yml) 자동 트리거 안내
 */

import { execSync } from 'child_process';

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────

function run(cmd: string, opts: { silent?: boolean } = {}): string {
  try {
    return execSync(cmd, {
      encoding: 'utf-8',
      stdio: opts.silent ? 'pipe' : ['inherit', 'pipe', 'pipe'],
    }).trim();
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & { stdout?: string; stderr?: string };
    throw new Error(e.stderr?.trim() || e.stdout?.trim() || e.message);
  }
}

function runCheck(cmd: string): boolean {
  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// ── 메인 ──────────────────────────────────────────────────────────────────────

console.log('\n🚀  운영(zerogo.ai) 승급 시작\n');

// 1. 최신 상태 fetch
console.log('📡  원격 브랜치 최신화 중...');
try {
  run('git fetch origin dev main', { silent: true });
} catch (err: unknown) {
  console.error('❌  git fetch 실패:', err instanceof Error ? err.message : String(err));
  console.error('   네트워크 연결 또는 git 인증을 확인해주세요.');
  process.exit(1);
}

// 2. SHA 비교 — 이미 최신?
let devSha: string;
let mainSha: string;
try {
  devSha = run('git rev-parse origin/dev', { silent: true });
  mainSha = run('git rev-parse origin/main', { silent: true });
} catch (err: unknown) {
  console.error('❌  브랜치 SHA 확인 실패:', err instanceof Error ? err.message : String(err));
  process.exit(1);
}

if (devSha === mainSha) {
  console.log('✅  운영(main)이 이미 dev와 동일합니다. 추가 작업 없음.\n');
  process.exit(0);
}

console.log(`   dev  : ${devSha.slice(0, 8)}`);
console.log(`   main : ${mainSha.slice(0, 8)}`);

// 3. fast-forward 가능 여부 검증
//    origin/main 이 origin/dev 의 조상이어야 FF 가능
const canFF = runCheck('git merge-base --is-ancestor origin/main origin/dev');
if (!canFF) {
  console.error('\n❌  운영(main) 브랜치가 dev에 없는 커밋을 가지고 있습니다 (분기 상태).');
  console.error('   fast-forward로 반영할 수 없습니다.');
  console.error('   개발자에게 문의해주세요.\n');
  process.exit(1);
}

// 4. fast-forward push (로컬 브랜치 전환 없이 원격만 업데이트)
console.log('\n⬆️   main 브랜치를 dev로 fast-forward 중...');
try {
  run('git push origin origin/dev:refs/heads/main');
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('non-fast-forward') || msg.includes('rejected')) {
    console.error('\n❌  fast-forward push가 거부되었습니다.');
    console.error('   main 브랜치가 보호(protected)되어 있거나 분기 상태일 수 있습니다.');
    console.error('   개발자에게 문의해주세요.\n');
  } else {
    console.error('\n❌  push 실패:', msg);
  }
  process.exit(1);
}

// 5. 완료 안내
console.log('\n✅  승급 완료!');
console.log('');
console.log('   운영 배포가 자동으로 시작되었습니다.');
console.log('   배포 진행 상황: https://github.com/moonklabs/zerogo-landing/actions');
console.log('   운영 URL       : https://zerogo.ai');
console.log('   (배포 완료까지 최대 10분 소요)\n');
