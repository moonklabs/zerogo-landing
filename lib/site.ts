// Central site constants shared across pages, metadata, and structured data.

export const SITE_URL = "https://www.zerogo.ai";
export const SITE_NAME = "ZEROGO";
export const SITE_TITLE =
  "ZEROGO AI - 쿠팡 판매자를 위한 품절 방지 AI 에이전트";
export const SITE_DESCRIPTION =
  "ZEROGO는 쿠팡 판매자를 위해 품절 위험을 감지하고 발주 타이밍을 알려주는 AI 에이전트입니다. 단순한 재고 관리를 넘어 오늘의 발주 판단을 도와줍니다.";

export const LOGO_URL =
  "https://cdn.prod.website-files.com/6523c202a6a9763a268a7a7d/69d8eb3622c77fc93875d989_logo-zerogo-black.png";
export const HERO_IMAGE_URL =
  "https://cdn.prod.website-files.com/6523c202a6a9763a268a7a7d/69d9151e0bd35c9af78cd437_hero-img.png";

// Coupang seller app (separate product). Prod vs dev resolved client-side.
export const APP_URL_PROD = "https://app.zerogo.ai";
export const APP_URL_DEV = "https://dev.app.zerogo.ai";

export const COMPANY = {
  legalName: "(주) 뭉클랩",
  enName: "Moonklabs Co., Ltd.",
  ceo: "윤도선",
  bizNo: "488-88-02579",
  address: "경기도 고양시 일산동구 무궁화로 20-38(로데오탑빌딩), 502호",
  email: "zerogo@moonklabs.com",
  foundingDate: "2024",
  github: "https://github.com/moonklabs",
} as const;

export const FAQ_ITEMS = [
  {
    q: "쿠팡 계정 연동은 어떻게 하나요?",
    a: "카카오로 가입한 뒤 쿠팡 계정을 연동하면, 제로고가 로켓그로스 상품의 재고와 판매 흐름을 기준으로 품절 위험 상품을 정리합니다.",
  },
  {
    q: "카카오 알림을 받을 수 있나요?",
    a: "네. 긴급·주의·입고 확인 건수와 오늘 봐야 할 상품명을 카카오 알림으로 받을 수 있도록 구성합니다.",
  },
  {
    q: "발주를 자동으로 해주나요?",
    a: "아니요. 제로고는 발주를 대신 실행하지 않습니다. 오늘 확인해야 할 상품과 발주 검토 대상을 알려드리고, 최종 발주는 셀러가 직접 판단합니다.",
  },
  {
    q: "'발주했어요'를 남기면 뭐가 좋아지나요?",
    a: "발주 수량과 예상 도착일을 남기면, 제로고가 입고까지 걸리는 기간을 기억합니다. 이 기록이 쌓이면 다음 재고 보충 알림을 더 정확하게 안내할 수 있습니다.",
  },
  {
    q: "내 쿠팡 데이터는 안전하게 관리되나요?",
    a: "제로고는 품절 위험 계산과 재고 보충 안내에 필요한 데이터를 기준으로 서비스를 제공합니다. 데이터 관리 방식과 연동 범위는 서비스 내에서 투명하게 안내됩니다.",
  },
] as const;
