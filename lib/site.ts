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
    q: "로켓그로스 계정 연동은 어떻게 하나요?",
    a: "ZEROGO 앱에서 안내에 따라 로켓그로스 운영에 필요한 정보를 연동하면 됩니다. 초기 설정이 막히는 경우 1:1로 직접 도와드립니다.",
  },
  {
    q: "발주를 자동으로 대신 해주나요?",
    a: "아니요. 발주 결정과 실행은 항상 셀러가 직접 합니다. ZEROGO는 오늘 확인해야 할 상품, 예상 품절일, 발주 마감일, 추천 수량처럼 판단에 필요한 정보를 먼저 정리해드립니다.",
  },
  {
    q: "추천 수량은 어떤 기준으로 계산하나요?",
    a: "현재 추정 재고, 최근 판매 속도, 예상 품절일, 발주 리드타임을 바탕으로 품절 전에 필요한 수량을 계산합니다. 상품별 상황에 따라 셀러가 최종 수량을 조정할 수 있습니다.",
  },
  {
    q: "카카오톡 알림을 받을 수 있나요?",
    a: "네. 중요한 품절 위험 상품과 오늘 확인해야 할 상품을 카카오 알림과 웹 대시보드에서 확인할 수 있도록 준비하고 있습니다.",
  },
  {
    q: "재고 관리는 왜 어려운가요?",
    a: "재고 관리가 어려운 이유는 단순히 수량을 아는 것이 아니라 언제 발주해야 하는지를 판단해야 하기 때문입니다. ZEROGO는 현재 추정 재고와 판매 속도를 바탕으로 발주 타이밍을 먼저 알려줍니다.",
  },
  {
    q: "품절을 막는 가장 중요한 방법은 무엇인가요?",
    a: "품절을 막기 위해 가장 중요한 것은 재고를 보는 것이 아니라 품절되기 전에 발주 타이밍을 잡는 것입니다. ZEROGO는 예상 품절일과 발주 마감일을 계산해 먼저 알려줍니다.",
  },
  {
    q: "기존 재고 관리 프로그램과 ZEROGO의 차이는 무엇인가요?",
    a: "기존 재고 관리 프로그램은 현재 재고를 보여주는 도구에 가깝습니다. ZEROGO는 오늘 발주해야 할 상품을 먼저 알려주는 품절 방지 AI 에이전트입니다.",
  },
  {
    q: "쿠팡 재고를 매일 확인해야 하나요?",
    a: "대부분의 셀러는 불안해서 매일 쿠팡에 들어가 재고를 확인합니다. ZEROGO는 위험 상품을 먼저 알려주기 때문에 직접 확인해야 하는 부담을 줄여줍니다.",
  },
  {
    q: "베타 기간에는 무엇을 사용할 수 있나요?",
    a: "베타 기간에는 오늘 확인해야 할 상품 정리, 품절 위험 확인, 발주 판단 보조 기능을 우선 제공합니다. 로켓그로스 셀러의 피드백을 바탕으로 기능을 빠르게 개선하고 있습니다.",
  },
  {
    q: "내 쿠팡 데이터는 안전하게 관리되나요?",
    a: "서비스 운영에 필요한 데이터만 사용하며, 무단으로 외부에 공개하지 않습니다. 운영 환경에서는 접근 권한과 서비스 설정을 분리해 관리합니다.",
  },
] as const;
