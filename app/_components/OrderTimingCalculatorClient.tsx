"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clipboard,
  Copy,
  Info,
  RotateCcw,
  Share2,
  TriangleAlert,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  APP_URL_DEV,
  APP_URL_PROD,
  COMPANY,
} from "@/lib/site";
import {
  buildCalculatorShareCopiedEvent,
  buildCalculatorShareUrl,
  buildOrderTimingCalculatedEvent,
  calculateOrderTiming,
  DEFAULT_LEAD_DAYS,
  DEFAULT_SAFETY_DAYS,
  DEFAULT_TARGET_DAYS,
  OrderTimingResult,
  SHARE_MESSAGES,
  ShareKey,
} from "@/lib/order-timing-calculator";
import { BlogFooter, SiteHeader } from "@/app/_components/BlogChrome";
import {
  buildAttributedAppUrl,
  captureLandingCtaClicked,
  type LandingCta,
  type LandingInitialAttribution,
} from "@/lib/activation-attribution";
import { pushGtmEvent } from "@/lib/gtm";

type FormState = {
  stock: string;
  daily: string;
  lead: string;
  safety: string;
  target: string;
};

const initialForm: FormState = {
  stock: "",
  daily: "",
  lead: String(DEFAULT_LEAD_DAYS),
  safety: String(DEFAULT_SAFETY_DAYS),
  target: String(DEFAULT_TARGET_DAYS),
};

const CALCULATOR_BETA_CTA: LandingCta = {
  id: "calculator_beta_primary",
  label: "카카오로 무료체험 시작하기",
};

type OrderTimingCalculatorClientProps = {
  initialAttribution?: LandingInitialAttribution;
};

const statusTone: Record<OrderTimingResult["status"], string> = {
  danger: "border-red-200 bg-red-50 text-red-700",
  reorder: "border-red-200 bg-red-50 text-red-700",
  soon: "border-amber-200 bg-amber-50 text-amber-800",
  safe: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const statusDot: Record<OrderTimingResult["status"], string> = {
  danger: "bg-red-500",
  reorder: "bg-red-500",
  soon: "bg-amber-500",
  safe: "bg-emerald-500",
};

export default function OrderTimingCalculatorClient({
  initialAttribution,
}: OrderTimingCalculatorClientProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<OrderTimingResult | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [betaUrl, setBetaUrl] = useState(APP_URL_PROD);
  const [betaHref, setBetaHref] = useState(() =>
    buildAttributedAppUrl(APP_URL_PROD, CALCULATOR_BETA_CTA, initialAttribution)
  );
  const [shareUrl, setShareUrl] = useState(
    "https://www.zerogo.ai/order-timing-calculator?utm_source=share&utm_medium=copy&utm_campaign=calc_viral"
  );
  const resultRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const nextBetaUrl =
      hostname.includes("localhost") ||
      hostname.includes("127.0.0.1") ||
      hostname.includes("dev")
        ? APP_URL_DEV
        : APP_URL_PROD;
    setBetaUrl(nextBetaUrl);
    setBetaHref(buildAttributedAppUrl(nextBetaUrl, CALCULATOR_BETA_CTA));
    setShareUrl(buildCalculatorShareUrl(window.location.origin, window.location.pathname));
  }, []);

  const shareMessage = useMemo(() => {
    if (!result) return "";
    return `${SHARE_MESSAGES[result.shareKey]}${shareUrl}`;
  }, [result, shareUrl]);

  useEffect(() => {
    if (!result) return;
    resultRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [result]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function parseNumber(value: string) {
    if (value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const stock = parseNumber(form.stock);
    const daily = parseNumber(form.daily);
    const lead = parseNumber(form.lead);
    const safety = parseNumber(form.safety);
    const target = parseNumber(form.target);

    if (stock === null || daily === null || lead === null || safety === null) {
      setResult(null);
      setError("현재 재고, 일평균 판매량, 리드타임, 안전재고를 모두 입력해주세요.");
      return;
    }

    if (stock < 0 || lead < 0 || safety < 0) {
      setResult(null);
      setError("현재 재고, 리드타임, 안전재고는 0 이상으로 입력해주세요.");
      return;
    }

    if (daily <= 0) {
      setResult(null);
      setError("일평균 판매량을 0보다 크게 입력해주세요.");
      return;
    }

    const input = { stock, daily, lead, safety, target };
    const nextResult = calculateOrderTiming(input);
    setError("");
    setResult(nextResult);
    pushGtmEvent(
      "order_timing_calculated",
      buildOrderTimingCalculatedEvent(input, nextResult)
    );
  }

  function resetForm() {
    setForm(initialForm);
    setResult(null);
    setError("");
  }

  async function copyText(text: string, message: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setToast(message);
      window.setTimeout(() => setToast(""), 2600);
    } catch {
      setToast("복사에 실패했어요. 직접 선택해 복사해주세요.");
      window.setTimeout(() => setToast(""), 2600);
    }
  }

  function copyShare(key: ShareKey) {
    if (result) {
      pushGtmEvent(
        "calculator_share_copied",
        buildCalculatorShareCopiedEvent({ action: "message", result })
      );
    }
    copyText(
      `${SHARE_MESSAGES[key]}${shareUrl}`,
      "공유 문구가 복사됐어요. 카톡, 카페, 스레드에 붙여넣기"
    );
  }

  function copyShareLink() {
    if (result) {
      pushGtmEvent(
        "calculator_share_copied",
        buildCalculatorShareCopiedEvent({ action: "link", result })
      );
    }
    copyText(shareUrl, "링크가 복사됐어요.");
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-brand selection:text-white">
      <SiteHeader initialAttribution={initialAttribution} />

      <main>
        <section className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8 lg:py-6">
          <div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-extrabold text-brand ring-1 ring-brand/20">
                      로켓그로스 셀러용 무료 도구
                    </span>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-black/60">
                      가입 없이 30초
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl lg:text-4xl">
                    이 상품, 오늘 발주해야 할까요?
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-black/60">
                    현재 재고와 일평균 판매량을 입력하면 발주 타이밍과 권장 수량을 바로 계산합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-black/55 transition hover:bg-neutral-50 hover:text-black"
                  aria-label="입력값 초기화"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                <NumberField
                  id="stock"
                  label="현재 재고 수량"
                  hint="지금 창고와 쿠팡 물류센터에 남아 있는 수량"
                  value={form.stock}
                  onChange={(value) => updateField("stock", value)}
                  placeholder="예: 120"
                  unit="개"
                />
                <NumberField
                  id="daily"
                  label="일평균 판매량"
                  hint="하루에 평균 몇 개씩 팔리나요"
                  value={form.daily}
                  onChange={(value) => updateField("daily", value)}
                  placeholder="예: 8"
                  unit="개/일"
                  step="0.1"
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <NumberField
                    id="lead"
                    label="입고 리드타임"
                    hint="발주에서 입고까지, 보통 4~7일"
                    value={form.lead}
                    onChange={(value) => updateField("lead", value)}
                    unit="일"
                  />
                  <NumberField
                    id="safety"
                    label="안전재고 여유"
                    hint="변동 대비 버퍼, 권장 3~5일"
                    value={form.safety}
                    onChange={(value) => updateField("safety", value)}
                    unit="일"
                  />
                  <NumberField
                    id="target"
                    label="목표 재고 보유일수"
                    hint="권장 30일"
                    value={form.target}
                    onChange={(value) => updateField("target", value)}
                    unit="일"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3.5 text-base font-extrabold text-white transition hover:opacity-90"
                >
                  발주 타이밍 계산하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </form>
            </div>

          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold tracking-tight text-black">
                  ZEROGO
                </span>
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-brand ring-1 ring-brand/20">
                  Beta
                </span>
              </div>
              <h2 className="mt-5 text-xl font-extrabold tracking-tight text-black">
                SKU가 30개 이상이라면?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-black/65">
                1개의 상품은 직접 계산할 수 있습니다. 그런데 모든 상품을 매일
                이렇게 계산하기는 어렵습니다.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-black/65">
                제로고는 모든 SKU를 매일 자동으로 살펴 품절 위험 상품, 오늘
                발주할 상품, 권장 발주 수량을 카카오톡으로 알려드립니다.
              </p>
              <a
                href={betaHref}
                onClick={(event) => {
                  event.currentTarget.href = buildAttributedAppUrl(
                    betaUrl,
                    CALCULATOR_BETA_CTA
                  );
                  captureLandingCtaClicked(CALCULATOR_BETA_CTA);
                }}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-3.5 text-sm font-extrabold text-white transition hover:opacity-90"
              >
                카카오로 무료체험 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>

          </aside>
        </section>

        {result && (
          <section
            ref={resultRef}
            className="mx-auto grid max-w-7xl scroll-mt-24 items-start gap-8 px-4 pb-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8"
            aria-live="polite"
          >
            <ResultCard
              result={result}
              shareMessage={shareMessage}
              shareUrl={shareUrl}
              copyShare={copyShare}
              copyShareLink={copyShareLink}
            />
            <CalculationMethodCard />
          </section>
        )}

        <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-black">
              <Info className="h-4 w-4 text-brand" />
              계산 가정
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-black/65">
              <li>판매 속도와 리드타임이 일정하다고 가정합니다.</li>
              <li>진행 중 발주, MOQ, 박스 단위는 반영하지 않습니다.</li>
              <li>프로모션, 시즌성, 급격한 주문 증가에는 추가 판단이 필요합니다.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-black">
              <Clipboard className="h-4 w-4 text-brand" />
              문의
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-black/65">
              계산 결과나 베타 사용 문의는 메일로 보내주세요.
            </p>
            <a
              href={`mailto:${COMPANY.email}`}
              className="mt-3 inline-flex text-sm font-extrabold text-brand"
            >
              {COMPANY.email}
            </a>
          </div>
        </section>
      </main>

      <BlogFooter />

      {toast && (
        <div className="fixed inset-x-4 bottom-6 z-[60] mx-auto max-w-md rounded-full bg-[#363636] px-5 py-3 text-center text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  unit,
  step = "1",
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  unit: string;
  step?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-extrabold text-black/80">{label}</span>
      <span className="mt-0.5 block text-xs leading-relaxed text-black/50">{hint}</span>
      <span className="relative mt-2 block">
        <input
          id={id}
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={step === "0.1" ? "decimal" : "numeric"}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 pr-14 text-base font-semibold text-black outline-none transition placeholder:text-black/25 focus:border-brand"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-black/35">
          {unit}
        </span>
      </span>
    </label>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center">
      <div className="text-xs font-bold text-black/45">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight text-black">
        {value}
      </div>
    </div>
  );
}

function ResultCard({
  result,
  shareMessage,
  shareUrl,
  copyShare,
  copyShareLink,
}: {
  result: OrderTimingResult;
  shareMessage: string;
  shareUrl: string;
  copyShare: (key: ShareKey) => void;
  copyShareLink: () => void;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm sm:p-6">
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-extrabold ${statusTone[result.status]}`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${statusDot[result.status]}`} />
        {result.badge}
      </div>
      <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-black">
        {result.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-black/70">
        {result.description}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ResultMetric label="재고 소진까지" value={`${result.displayDaysLeft}일`} />
        <ResultMetric
          label="발주 시점"
          value={`D-${result.displayDaysUntilReorder}`}
        />
        <ResultMetric
          label="권장 발주 수량"
          value={`${result.recommendQty.toLocaleString("ko-KR")}개`}
        />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-black/50">
        일평균 판매량이 일정하다고 가정한 추정치입니다. 권장 수량은 목표
        보유일수 {result.targetDays}일 기준입니다. 시즌성, 프로모션, 판매 급증
        예측은 ZEROGO 베타 버전에서 확인할 수 있습니다.
      </p>

      <div className="mt-5 border-t border-dashed border-neutral-300 pt-5">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm leading-relaxed text-black/70">
          {shareMessage}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => copyShare(result.shareKey)}
            className="inline-flex items-center justify-center rounded-2xl bg-[#363636] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-black"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {result.shareKey === "safe"
              ? "계산기 공유하기"
              : "이 위험, 동료 셀러에게 알리기"}
          </button>
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-extrabold text-black/70 transition hover:bg-neutral-50"
          >
            <Copy className="mr-2 h-4 w-4" />
            링크만 복사
          </button>
        </div>
      </div>
    </div>
  );
}

function CalculationMethodCard() {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-[#363636] p-6 text-white shadow-sm lg:self-start">
      <div className="text-xs font-extrabold uppercase tracking-widest text-brand">
        ZEROGO 계산 방식
      </div>
      <h2 className="mt-2 text-xl font-extrabold tracking-tight">
        남은 일수에서 리드타임과 안전재고를 뺍니다
      </h2>
      <div className="mt-5 space-y-3 text-sm text-white/75">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          재고 소진까지 = 현재 재고 / 일평균 판매량
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          발주까지 남은 일수 = 재고 소진까지 - (리드타임 + 안전재고)
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          권장 발주 수량 = 일평균 판매량 x 목표 보유일수
        </div>
      </div>
    </div>
  );
}
