// Central site constants shared across pages, metadata, and structured data.

export const SITE_URL = "https://zerogo.ai";
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
  email: "sellerking@moonklabs.com",
  foundingDate: "2024",
  github: "https://github.com/moonklabs",
} as const;

export const FAQ_ITEMS = [
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
] as const;
