export type ReorderStatus = "danger" | "reorder" | "soon" | "safe";
export type ShareKey = "danger" | "reorder" | "safe";

export type OrderTimingInput = {
  stock: number;
  daily: number;
  lead: number;
  safety: number;
  target?: number | null;
};

export type OrderTimingResult = {
  daysLeft: number;
  bufferDays: number;
  daysUntilReorder: number;
  recommendQty: number;
  displayDaysLeft: number;
  displayDaysUntilReorder: number;
  targetDays: number;
  status: ReorderStatus;
  shareKey: ShareKey;
  badge: string;
  title: string;
  description: string;
};

export const DEFAULT_LEAD_DAYS = 7;
export const DEFAULT_SAFETY_DAYS = 3;
export const DEFAULT_TARGET_DAYS = 30;

export const SHARE_MESSAGES: Record<ShareKey, string> = {
  danger:
    "재고 점검하다 봤는데 이 상품 이미 발주 늦었더라고요. 재고 '며칠 남았는지' 30초면 나오는 계산기. 로켓그로스 셀러분들 한번 돌려보세요: ",
  reorder:
    "재고 '개수'만 보면 품절 못 막아요. 며칠 남았는지, 오늘 발주할지 30초면 나오는 발주 타이밍 계산기: ",
  safe:
    "쿠팡 로켓그로스 발주 타이밍 계산기. 재고 몇 개 말고 며칠 남았는지로 보세요. 가입 없이 30초: ",
};

export function calculateOrderTiming(
  input: OrderTimingInput
): OrderTimingResult {
  const targetDays =
    input.target === null || input.target === undefined || input.target < 1
      ? DEFAULT_TARGET_DAYS
      : input.target;
  const daysLeft = input.stock / input.daily;
  const bufferDays = input.lead + input.safety;
  const daysUntilReorder = daysLeft - bufferDays;
  const recommendQty = Math.round(input.daily * targetDays);
  const displayDaysLeft = Math.floor(daysLeft);
  const displayDaysUntilReorder = Math.max(0, Math.floor(daysUntilReorder));

  if (daysUntilReorder <= 0) {
    if (daysLeft <= input.lead) {
      return {
        daysLeft,
        bufferDays,
        daysUntilReorder,
        recommendQty,
        displayDaysLeft,
        displayDaysUntilReorder,
        targetDays,
        status: "danger",
        shareKey: "danger",
        badge: "지금 발주하세요",
        title: "품절 위험: 입고 전에 재고가 바닥납니다",
        description: `지금 발주해도 입고 ${input.lead}일까지 재고가 버티지 못합니다. 즉시 발주하고, 가능하면 입고를 앞당기세요.`,
      };
    }

    return {
      daysLeft,
      bufferDays,
      daysUntilReorder,
      recommendQty,
      displayDaysLeft,
      displayDaysUntilReorder,
      targetDays,
      status: "reorder",
      shareKey: "reorder",
      badge: "지금 발주하세요",
      title: "발주 타이밍이 됐습니다",
      description:
        "지금 발주하지 않으면 안전재고가 무너집니다. 오늘 발주하세요.",
    };
  }

  if (daysUntilReorder <= 2) {
    return {
      daysLeft,
      bufferDays,
      daysUntilReorder,
      recommendQty,
      displayDaysLeft,
      displayDaysUntilReorder,
      targetDays,
      status: "soon",
      shareKey: "reorder",
      badge: `곧 발주 (D-${Math.floor(daysUntilReorder)})`,
      title: "발주 타이밍이 임박했습니다",
      description: `약 ${Math.floor(
        daysUntilReorder
      )}일 뒤 발주점에 도달합니다. 미리 준비하세요.`,
    };
  }

  return {
    daysLeft,
    bufferDays,
    daysUntilReorder,
    recommendQty,
    displayDaysLeft,
    displayDaysUntilReorder,
    targetDays,
    status: "safe",
    shareKey: "safe",
    badge: `여유 있음 (D-${Math.floor(daysUntilReorder)})`,
    title: "아직 발주하지 않아도 됩니다",
    description: `약 ${Math.floor(
      daysUntilReorder
    )}일 뒤가 발주 시점입니다. 그때 발주하면 품절 없이 이어집니다.`,
  };
}

export function buildCalculatorShareUrl(origin: string, pathname: string) {
  return `${origin}${pathname}?utm_source=share&utm_medium=copy&utm_campaign=calc_viral`;
}

export function buildOrderTimingCalculatedEvent(
  input: OrderTimingInput,
  result: OrderTimingResult
) {
  return {
    category: "activation",
    funnel: "calculator",
    step: "order_timing_calculated",
    result: result.status,
    calculator_status: result.status,
    calculator_share_key: result.shareKey,
    days_left: Number(result.daysLeft.toFixed(2)),
    days_until_reorder: Number(result.daysUntilReorder.toFixed(2)),
    buffer_days: result.bufferDays,
    target_days: result.targetDays,
    recommend_qty: result.recommendQty,
    input_stock: input.stock,
    input_daily_sales: input.daily,
    input_lead_days: input.lead,
    input_safety_days: input.safety,
  };
}

export function buildCalculatorShareCopiedEvent({
  action,
  result,
}: {
  action: "message" | "link";
  result: OrderTimingResult;
}) {
  return {
    category: "activation",
    funnel: "calculator",
    step: "calculator_share",
    result: "copied",
    share_action: action,
    calculator_status: result.status,
    calculator_share_key: result.shareKey,
  };
}
