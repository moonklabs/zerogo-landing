"use client";

import { motion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  LayoutGrid,
  ListChecks,
  PencilLine,
  RotateCcw,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { APP_URL_PROD, APP_URL_DEV, FAQ_ITEMS } from "@/lib/site";
import { SiteHeader } from "@/app/_components/BlogChrome";
import {
  buildAttributedAppUrl,
  captureLandingCtaClicked,
  type LandingInitialAttribution,
  type LandingCta,
} from "@/lib/activation-attribution";
import type { LandingVariantSlots } from "@/lib/landing-variant";

const CTA_LABEL = "카카오로 7일 무료체험 시작하기";
const HERO_CTA: LandingCta = { id: "home_hero_primary", label: CTA_LABEL };
const SOLUTION_CTA: LandingCta = { id: "home_solution_primary", label: CTA_LABEL };
const STEPS_CTA: LandingCta = { id: "home_steps_primary", label: CTA_LABEL };
const BOTTOM_CTA: LandingCta = { id: "home_bottom_primary", label: CTA_LABEL };

const PROBLEM_CARDS = [
  {
    icon: TrendingDown,
    title: "품절 후 순위가 떨어집니다",
    desc: "한 번 끊긴 판매 흐름은 회복까지 시간이 걸립니다.",
  },
  {
    icon: ShoppingCart,
    title: "발주가 늦으면 매출이 샙니다",
    desc: "재고가 비는 동안 노출 기회와 매출을 잃습니다.",
  },
  {
    icon: ListChecks,
    title: "계정마다 보다가 놓칩니다",
    desc: "여러 계정과 SKU를 오가면 급한 상품이 묻힙니다.",
  },
  {
    icon: HelpCircle,
    title: "입고일을 감으로 잡습니다",
    desc: "상품별 입고 소요 기간을 기억하지 못해 보충이 늦어집니다.",
  },
];

const BRIEFING_CARDS = [
  { title: "매일 아침 브리핑", desc: "긴급·주의·입고 확인 건수를 카카오로 먼저 받아봅니다." },
  { title: "상품명까지 바로 확인", desc: "알림 안에서 오늘 봐야 할 상품 목록을 바로 확인합니다." },
  { title: "대시보드 바로가기", desc: "알림 하단 버튼으로 대시보드에 바로 연결됩니다." },
];

const FEATURE_CARDS = [
  { icon: AlertTriangle, title: "품절 위험 상품 자동 정리", desc: "재고와 판매 흐름을 기준으로 먼저 확인할 상품을 보여드립니다." },
  { icon: CheckCircle2, title: "오늘 발주 검토 대상 표시", desc: "품절 전에 보충해야 할 상품을 빠르게 확인합니다." },
  { icon: LayoutGrid, title: "여러 계정 한 화면 관리", desc: "계정마다 따로 열어보지 않아도 됩니다." },
  { icon: null, title: "카카오 알림", desc: "중요한 상품을 놓치지 않도록 먼저 알려드립니다." },
  { icon: PencilLine, title: "발주했어요 기록", desc: "발주 수량과 예상 도착일을 남겨 다음 알림에 반영합니다." },
  { icon: RotateCcw, title: "입고 확인 관리", desc: "발주한 상품이 실제로 입고됐는지 확인하고 다음 판단에 반영합니다." },
];

const STEPS = [
  { step: "STEP 1", title: "카카오로 가입", desc: "7일 무료체험이 시작됩니다." },
  { step: "STEP 2", title: "쿠팡 계정 연동", desc: "여러 계정의 재고를 한 화면으로 모읍니다." },
  { step: "STEP 3", title: "품절 위험 상품 확인", desc: "오늘 발주할 상품부터 확인합니다." },
];

const TRUST_POINTS = [
  "발주는 셀러가 직접 판단하고 실행합니다.",
  "제로고는 오늘 봐야 할 상품을 먼저 안내해 드립니다.",
  "발주 기록은 다음 재고 보충 알림을 더 정확하게 만드는 데 사용됩니다.",
];

function useAttributedHref(
  appUrl: string,
  cta: LandingCta,
  initialAttribution?: LandingInitialAttribution
) {
  const [href, setHref] = useState(() =>
    buildAttributedAppUrl(APP_URL_PROD, cta, initialAttribution)
  );
  useEffect(() => {
    setHref(buildAttributedAppUrl(appUrl, cta));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUrl]);
  return href;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="overflow-hidden rounded-[18px] border border-[#e9e9e9] bg-white"
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-[26px] py-6 text-[18px] font-black leading-[27px] tracking-[-0.024em] text-black marker:hidden max-[640px]:px-5 max-[640px]:py-5 max-[640px]:text-[16px] [&::-webkit-details-marker]:hidden">
        {q}
        <span className="shrink-0 text-2xl leading-6 font-black text-brand">
          {open ? "−" : "+"}
        </span>
      </summary>
      <p className="px-[26px] pb-6 text-[16px] leading-[27px] text-[#666] max-[640px]:px-5 max-[640px]:pb-5 max-[640px]:text-[15px]">
        {a}
      </p>
    </details>
  );
}

type HomeClientProps = {
  initialAttribution?: LandingInitialAttribution;
  // 실험 변형 슬롯 (utm_content로 발행된 문구) — null이면 기본 문구 렌더
  variantSlots?: LandingVariantSlots | null;
};

export default function HomeClient({ initialAttribution, variantSlots }: HomeClientProps) {
  const [appUrl, setAppUrl] = useState(APP_URL_PROD);

  useEffect(() => {
    const hostname = window.location.hostname;
    const nextAppUrl =
      hostname.includes("localhost") ||
      hostname.includes("127.0.0.1") ||
      hostname.includes("dev")
        ? APP_URL_DEV
        : APP_URL_PROD;
    setAppUrl(nextAppUrl);
  }, []);

  // 변형 CTA 문구는 클릭 계측 라벨에도 그대로 실린다 (같은 id, label만 교체)
  const heroCta: LandingCta = variantSlots?.ctaText
    ? { id: HERO_CTA.id, label: variantSlots.ctaText }
    : HERO_CTA;
  const heroHref = useAttributedHref(appUrl, heroCta, initialAttribution);
  const solutionHref = useAttributedHref(appUrl, SOLUTION_CTA, initialAttribution);
  const stepsHref = useAttributedHref(appUrl, STEPS_CTA, initialAttribution);
  const bottomHref = useAttributedHref(appUrl, BOTTOM_CTA, initialAttribution);

  const makeCtaClickHandler =
    (cta: LandingCta) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.currentTarget.href = buildAttributedAppUrl(appUrl, cta);
      captureLandingCtaClicked(cta);
    };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#0b0b0d] selection:bg-brand/20 selection:text-brand">
      <SiteHeader initialAttribution={initialAttribution} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-white pt-[92px] pb-[114px] max-[900px]:pt-[70px] max-[900px]:pb-[88px] max-[640px]:pt-[52px] max-[640px]:pb-[70px]">
          <div className="mx-auto w-full max-w-[1180px] px-5 max-[1200px]:max-w-[1040px] max-[640px]:px-[14px]">
            <motion.div
              className="mx-auto max-w-[1045px] text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-flex items-center justify-center rounded-full border border-brand/25 bg-brand/[0.03] px-[17px] py-[9px] text-[16px] font-extrabold tracking-[0.075em] text-brand uppercase max-[640px]:px-3 max-[640px]:py-2 max-[640px]:text-[12px]">
                로켓그로스 품절 방지
              </span>
              <h1 className="mt-[31px] text-[70px] leading-[90px] font-black tracking-[-0.03em] text-black max-[1200px]:text-[58px] max-[1200px]:leading-[1.22] max-[900px]:text-[44px] max-[640px]:text-[34px] max-[640px]:leading-[1.24] max-[640px]:tracking-[-0.045em]">
                {variantSlots ? (
                  variantSlots.headline
                ) : (
                  <>
                    여러 계정 판매로
                    <br />
                    <span className="text-brand">품절 날까 걱정이라면?</span>
                  </>
                )}
              </h1>
              <p className="mx-auto mt-[31px] max-w-[1045px] text-[22px] leading-[36px] font-semibold text-black/70 max-[1200px]:text-[20px] max-[1200px]:leading-[1.65] max-[900px]:text-[18px] max-[640px]:text-[16px] max-[640px]:leading-[1.6]">
                {variantSlots?.subheadline ? (
                  variantSlots.subheadline
                ) : (
                  <>
                    계정마다 열어보던 재고 확인을
                    <br />
                    따로 열지 않아도, 오늘 먼저 볼 상품만 모아서 확인할 수 있습니다.
                  </>
                )}
              </p>
              <div className="mt-[37px] flex justify-center">
                <a
                  href={heroHref}
                  onClick={makeCtaClickHandler(heroCta)}
                  className="inline-flex min-h-[70px] min-w-[335px] items-center justify-center rounded-full bg-brand px-8 text-[20px] font-extrabold text-white shadow-[0_10px_12px_rgba(255,86,25,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(255,86,25,0.25)] max-[900px]:min-h-[60px] max-[900px]:w-full max-[900px]:max-w-[335px] max-[900px]:min-w-0 max-[640px]:text-[17px]"
                >
                  {heroCta.label} →
                </a>
              </div>
            </motion.div>

            <motion.div
              className="relative mx-auto mt-10 max-w-[1195px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
            >
              <div
                aria-hidden
                className="absolute -inset-0.5 z-0 translate-x-[18px] translate-y-[18px] rounded-[38px] bg-[linear-gradient(151deg,rgba(255,86,25,0.6)_0%,rgba(0,0,0,0)_35%,rgba(255,86,25,0.24)_100%)]"
              />
              <div className="relative z-10 overflow-hidden rounded-[19px] border border-[#e5e5e5] bg-white p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-[640px]:rounded-2xl max-[640px]:p-2.5">
                <div className="relative overflow-hidden rounded-[14px] bg-[#eef3f6] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] max-[640px]:rounded-xl">
                  <video
                    className="h-auto w-full"
                    width={7200}
                    height={4030}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="ZEROGO 대시보드 데모 영상"
                  >
                    <source src="/zerogo_demo.mp4" type="video/mp4" />
                    브라우저가 영상을 지원하지 않습니다.
                  </video>
                  <div className="absolute top-[23px] left-[23px] rounded-full bg-brand px-3.5 py-[5px] text-[13.3px] font-black tracking-[0.026em] text-white uppercase shadow-[0_0_0_1px_rgba(255,255,255,0.3),0_1px_3px_rgba(255,86,25,0.2)] max-[640px]:top-2.5 max-[640px]:left-2.5 max-[640px]:px-2.5 max-[640px]:py-1 max-[640px]:text-[11px]">
                    실제 데모 화면
                  </div>
                  <div className="absolute bottom-[28px] left-1/2 max-w-[calc(100%-48px)] -translate-x-1/2 rounded-full bg-black/70 px-[23px] py-2.5 text-[15.4px] font-bold whitespace-nowrap text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] backdrop-blur-[4px] max-[640px]:bottom-2.5 max-[640px]:left-2.5 max-[640px]:right-2.5 max-[640px]:max-w-none max-[640px]:translate-x-0 max-[640px]:text-center max-[640px]:text-[12px] max-[640px]:whitespace-normal">
                    여러 계정에 흩어진 품절위기 상품을 한눈에 확인하실 수 있어요.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problem */}
        <section className="bg-[#fafafa] py-[112px] max-[900px]:py-[86px] max-[640px]:py-[68px]">
          <div className="mx-auto w-full max-w-[1180px] px-5 max-[1200px]:max-w-[1040px] max-[640px]:px-[14px]">
            <h2 className="mx-auto max-w-[820px] text-center text-[48px] leading-[58.56px] font-black tracking-[-0.048em] text-black max-[900px]:text-[36px] max-[900px]:leading-[1.28] max-[900px]:tracking-[-1.5px] max-[640px]:text-[30px] max-[640px]:leading-[1.28] max-[640px]:tracking-[-1px]">
              품절은 재고를 몰라서가 아니라
              <br />
              발주 타이밍을 놓쳐서 생깁니다
            </h2>
            <p className="mx-auto mt-5 max-w-[760px] text-center text-[20px] leading-[35px] font-semibold text-[#666] max-[900px]:text-[17px] max-[900px]:leading-[1.65] max-[640px]:text-[16px] max-[640px]:leading-[1.6]">
              재고가 아직 남아 보여도, 입고까지 걸리는 시간을 놓치면 품절은 갑자기 옵니다.
              품절이 나면 판매 흐름이 끊기고, 순위 회복까지 시간이 걸립니다.
            </p>
            <motion.div
              className="mt-[58px] grid grid-cols-4 gap-5 max-[1200px]:grid-cols-2 max-[640px]:grid-cols-1"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
            >
              {PROBLEM_CARDS.map(({ icon: Icon, title, desc }) => (
                <motion.article
                  key={title}
                  variants={fadeIn}
                  className="min-h-[228px] rounded-[28px] border border-[#e9e9e9] bg-white p-[31px] max-[640px]:min-h-0 max-[640px]:rounded-[22px] max-[640px]:p-6"
                >
                  <div className="mb-[22px] flex h-[50px] w-[50px] items-center justify-center rounded-[17px] bg-brand/10 text-brand">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-[23px] leading-[31px] font-semibold tracking-[-0.044em] text-black max-[640px]:text-[21px]">
                    {title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-[26.4px] font-medium text-[#666]">{desc}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Solution */}
        <section className="w-full bg-white py-[112px] max-[900px]:py-[86px] max-[640px]:py-[68px]">
          <div className="mx-auto flex w-full max-w-[1180px] flex-row items-center justify-between gap-10 px-5 max-[1200px]:max-w-[1040px] max-[1200px]:px-6 max-[900px]:flex-col max-[900px]:items-center max-[640px]:px-[14px]">
            <div className="flex w-[469px] shrink-0 flex-col items-start max-[1200px]:w-auto max-[1200px]:flex-1 max-[900px]:w-full max-[900px]:items-center max-[900px]:text-center">
              <h2 className="pt-[14px] text-[48px] leading-[58.56px] font-black tracking-[-0.048em] text-black max-[900px]:text-[36px] max-[900px]:leading-[1.28] max-[900px]:tracking-[-1.5px] max-[640px]:text-[30px] max-[640px]:leading-[1.28] max-[640px]:tracking-[-1px]">
                오늘 발주할 상품을
                <br />
                모아서 보여드립니다
              </h2>
              <p className="max-w-[470px] pt-5 text-[20px] leading-[35px] font-semibold text-[#666] max-[900px]:max-w-[640px] max-[900px]:text-[17px] max-[900px]:leading-[1.65] max-[640px]:text-[16px] max-[640px]:leading-[1.6]">
                여러 로켓그로스 계정의 재고와 판매 흐름을 모아 품절 위험 상품을 한눈에 확인하실 수
                있습니다.
              </p>
              <div className="w-full max-w-[470px] pt-[30px] max-[900px]:flex max-[900px]:max-w-none max-[900px]:justify-center">
                <a
                  href={solutionHref}
                  onClick={makeCtaClickHandler(SOLUTION_CTA)}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-brand px-7 text-[16px] font-extrabold text-white shadow-[0_10px_12px_rgba(255,86,25,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(255,86,25,0.25)]"
                >
                  카카오로 7일 무료체험 시작하기
                </a>
              </div>
            </div>

            <div
              className="relative h-[420px] w-[616px] shrink-0 overflow-hidden rounded-[20px] border border-[#e9e9e9] bg-white max-[1200px]:h-auto max-[1200px]:w-full max-[1200px]:max-w-[616px] max-[900px]:w-full max-[900px]:max-w-[616px]"
              style={{ boxShadow: "0px 22px 60px 0px rgba(16,16,16,0.1)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/home/order-preview.png"
                alt="오늘 발주할 상품 화면"
                className="h-full w-full object-cover max-[1200px]:aspect-[616/420] max-[1200px]:h-auto"
              />
            </div>
          </div>
        </section>

        {/* Briefing */}
        <section className="w-full bg-[#4e95d9] py-[100px] max-[900px]:py-[86px] max-[640px]:py-[70px]">
          <div className="mx-auto w-full max-w-[1180px] px-5 max-[1200px]:max-w-[1040px] max-[640px]:px-[14px]">
            <h2 className="mx-auto max-w-[820px] text-center text-[48px] leading-[58.56px] font-black tracking-[-0.048em] text-white max-[900px]:text-[36px] max-[900px]:leading-[1.28] max-[900px]:tracking-[-1.5px] max-[640px]:text-[30px] max-[640px]:leading-[1.28] max-[640px]:tracking-[-1px]">
              매일 아침, 오늘의 재고 브리핑을
              <br />
              카카오로 먼저 받아보세요
            </h2>
            <p className="mx-auto mt-5 max-w-[760px] text-center text-[20px] leading-[34px] font-semibold text-white/80 max-[900px]:text-[17px] max-[900px]:leading-[1.65] max-[640px]:text-[16px] max-[640px]:leading-[1.6]">
              긴급·주의·입고 확인 건수와 오늘 봐야 할 상품명을 한 번에 알려드립니다. 대시보드를 열기
              전에 이미 무엇부터 볼지 알 수 있습니다.
            </p>

            <div className="mt-[58px] flex flex-row items-center justify-between gap-14 max-[1200px]:flex-col max-[1200px]:items-center max-[900px]:gap-10 max-[900px]:pt-[0px]">
              <div className="flex w-[568px] shrink-0 flex-col gap-5 max-[1200px]:w-full max-[1200px]:max-w-[720px]">
                {BRIEFING_CARDS.map(({ title, desc }) => (
                  <div
                    key={title}
                    className="relative w-full rounded-2xl bg-[#3f7bc3] drop-shadow-[0px_12px_18px_rgba(11,0,158,0.1)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10"
                    />
                    <div className="relative flex flex-col items-start px-[34px] pt-5 pb-[30px] max-[640px]:px-6 max-[640px]:pb-6">
                      <p className="pt-[10px] text-[24px] leading-[32px] font-bold tracking-[-0.8px] text-white max-[640px]:text-[20px] max-[640px]:leading-[1.35]">
                        {title}
                      </p>
                      <p className="text-[16px] leading-[26px] tracking-[-0.3px] text-white/80">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex w-[475px] shrink-0 items-center justify-center drop-shadow-[-20px_16px_10px_rgba(0,0,0,0.1)] max-[1200px]:w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/home/kakao-briefing.png"
                  alt="제로고 카카오 알림톡 실제 메시지 예시"
                  className="w-[299px] rounded-2xl object-cover max-[900px]:w-[min(299px,90vw)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-[#fafafa] py-[112px] max-[900px]:py-[86px] max-[640px]:py-[68px]">
          <div className="mx-auto w-full max-w-[1180px] px-5 max-[1200px]:max-w-[1040px] max-[640px]:px-[14px]">
            <h2 className="mx-auto max-w-[820px] text-center text-[48px] leading-[58.56px] font-black tracking-[-0.048em] text-black max-[900px]:text-[36px] max-[900px]:leading-[1.28] max-[900px]:tracking-[-1.5px] max-[640px]:text-[30px] max-[640px]:leading-[1.28] max-[640px]:tracking-[-1px]">
              품절 위험을 먼저 보고
              <br />
              처리 상태까지 남깁니다
            </h2>
            <p className="mx-auto mt-5 max-w-[760px] text-center text-[20px] leading-[35px] font-semibold text-[#666] max-[900px]:text-[17px] max-[900px]:leading-[1.65] max-[640px]:text-[16px] max-[640px]:leading-[1.6]">
              매일 모든 SKU를 다 보는 대신, 오늘 확인해야 할 상품만 우선순위로 확인하세요.
            </p>
            <div className="mt-[58px] grid grid-cols-3 gap-[22px] max-[1200px]:grid-cols-2 max-[640px]:grid-cols-1">
              {FEATURE_CARDS.map(({ icon: Icon, title, desc }) => (
                <article
                  key={title}
                  className="min-h-[230px] rounded-[28px] border border-[#e9e9e9] bg-white p-[31px] max-[640px]:min-h-0 max-[640px]:rounded-[22px] max-[640px]:p-6"
                >
                  <div className="mb-[22px] flex h-[50px] w-[50px] items-center justify-center rounded-[17px] bg-brand/10 text-brand">
                    {Icon ? (
                      <Icon className="h-6 w-6" />
                    ) : (
                      <span className="text-[15px] font-black">톡</span>
                    )}
                  </div>
                  <h3 className="text-[23px] leading-[31px] font-semibold tracking-[-0.044em] text-black max-[640px]:text-[21px]">
                    {title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-[26.4px] font-medium text-[#666]">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="w-full bg-white py-[112px] max-[900px]:py-[86px] max-[640px]:py-[68px]">
          <div className="mx-auto w-full max-w-[1180px] px-5 max-[1200px]:max-w-[1040px] max-[640px]:px-[14px]">
            <h2 className="mx-auto max-w-[820px] text-center text-[48px] leading-[58.56px] font-black tracking-[-0.048em] text-black max-[900px]:text-[36px] max-[900px]:leading-[1.28] max-[900px]:tracking-[-1.5px] max-[640px]:text-[30px] max-[640px]:leading-[1.28] max-[640px]:tracking-[-1px]">
              3단계면 품절 위험 상품을 확인합니다
            </h2>
            <p className="mx-auto mt-5 max-w-[760px] text-center text-[20px] leading-[35px] font-semibold text-[#666] max-[900px]:text-[17px] max-[900px]:leading-[1.65] max-[640px]:text-[16px] max-[640px]:leading-[1.6]">
              가입 후 쿠팡 계정을 연동하면 오늘 발주를 검토할 상품부터 볼 수 있습니다.
            </p>
            <div className="mt-[58px] grid grid-cols-3 gap-[22px] max-[900px]:grid-cols-1">
              {STEPS.map(({ step, title, desc }) => (
                <article
                  key={step}
                  className="min-h-[210px] rounded-[28px] border border-[#e9e9e9] bg-white p-[31px] max-[640px]:min-h-0 max-[640px]:rounded-[22px] max-[640px]:p-6"
                >
                  <span className="inline-flex h-[39px] items-center justify-center rounded-full border border-brand/20 bg-brand/10 px-[15px] text-[14px] font-black text-brand">
                    {step}
                  </span>
                  <h3 className="mt-5 text-[23px] leading-[31px] font-semibold tracking-[-0.044em] text-black max-[640px]:text-[21px]">
                    {title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-[26.4px] font-medium text-[#666]">{desc}</p>
                </article>
              ))}
            </div>
            <div className="mt-[46px] text-center">
              <a
                href={stepsHref}
                onClick={makeCtaClickHandler(STEPS_CTA)}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-brand px-7 text-[16px] font-extrabold text-white shadow-[0_10px_12px_rgba(255,86,25,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(255,86,25,0.25)]"
              >
                카카오로 7일 무료체험 시작하기
              </a>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="bg-[#fafafa] py-[112px] max-[900px]:py-[86px] max-[640px]:py-[68px]">
          <div className="mx-auto w-full max-w-[1180px] px-5 max-[1200px]:max-w-[1040px] max-[640px]:px-[14px]">
            <div className="mx-auto max-w-[980px] rounded-[34px] border border-[#e9e9e9] bg-white p-[55px] text-center max-[640px]:rounded-[26px] max-[640px]:p-[30px_20px]">
              <span className="inline-flex h-[39px] items-center justify-center rounded-full border border-brand/20 bg-brand/10 px-[15px] text-[14px] font-black text-brand">
                안심 안내
              </span>
              <h2 className="mt-[18px] text-[42px] leading-[63px] font-semibold tracking-[-0.041em] text-black max-[640px]:text-[32px] max-[640px]:leading-[1.35]">
                발주를 대신 실행하지 않습니다
              </h2>
              <p className="mx-auto mt-[18px] max-w-[760px] text-[19px] leading-[33.25px] text-[#666]">
                제로고는 로켓그로스 상품의 재고와 판매 흐름, 그리고 사용자가 남긴 발주 기록을
                바탕으로 오늘 확인할 상품과 재고 보충 시점을 알려주는 서비스입니다.
              </p>
              <div className="mt-[30px] grid grid-cols-3 gap-3.5 max-[640px]:grid-cols-1">
                {TRUST_POINTS.map((point) => (
                  <div
                    key={point}
                    className="rounded-[20px] border border-[#eee] bg-[#fafafa] p-[19px] text-left text-[15px] leading-[23.25px] font-semibold text-[#555]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full bg-white py-[112px] max-[900px]:py-[86px] max-[640px]:py-[68px]" id="faq">
          <div className="mx-auto w-full max-w-[1180px] px-5 max-[1200px]:max-w-[1040px] max-[640px]:px-[14px]">
            <h2 className="mx-auto max-w-[820px] text-center text-[48px] leading-[58.56px] font-black tracking-[-0.048em] text-black max-[900px]:text-[36px] max-[900px]:leading-[1.28] max-[900px]:tracking-[-1.5px] max-[640px]:text-[30px] max-[640px]:leading-[1.28] max-[640px]:tracking-[-1px]">
              자주 묻는 질문
            </h2>
            <p className="mx-auto mt-5 max-w-[760px] text-center text-[20px] leading-[35px] font-semibold text-[#666] max-[900px]:text-[17px] max-[900px]:leading-[1.65] max-[640px]:text-[16px] max-[640px]:leading-[1.6]">
              무료체험 전에 가장 많이 궁금해하는 내용만 정리했습니다.
            </p>
            <div className="mx-auto mt-[54px] flex max-w-[860px] flex-col gap-3">
              {FAQ_ITEMS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full bg-[#2f2f2f] py-[100px] text-center max-[900px]:py-[86px] max-[640px]:py-[70px]">
          <div className="mx-auto w-full max-w-[1180px] px-5 max-[1200px]:max-w-[1040px] max-[640px]:px-[14px]">
            <h2 className="mx-auto max-w-[820px] text-[56px] leading-[68.32px] font-black tracking-[-0.048em] text-white max-[900px]:text-[40px] max-[900px]:leading-[1.25] max-[640px]:text-[32px] max-[640px]:leading-[1.28]">
              다음 품절 전에 먼저 확인하세요
            </h2>
            <p className="mx-auto mt-5 max-w-[760px] text-[20px] leading-[34px] font-semibold text-white/70 max-[900px]:text-[17px] max-[900px]:leading-[1.65] max-[640px]:text-[16px] max-[640px]:leading-[1.6]">
              계정마다 따로 보지 말고, 오늘 발주를 검토할 상품부터 한 번에 확인하세요.
            </p>
            <div className="mt-[34px] flex justify-center">
              <a
                href={bottomHref}
                onClick={makeCtaClickHandler(BOTTOM_CTA)}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-brand px-7 text-[16px] font-extrabold text-white shadow-[0_10px_12px_rgba(255,86,25,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(255,86,25,0.25)]"
              >
                카카오로 7일 무료체험 시작하기
              </a>
            </div>
            <p className="mt-[22px] text-[16px] leading-6 font-bold text-white/70">
              품절이 난 뒤 확인하면 늦습니다. 순위가 떨어지기 전에 먼저 확인하세요.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e9e9e9] bg-white py-[58px]">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col items-start justify-between gap-8 px-5 max-[1200px]:max-w-[1040px] max-[640px]:px-[14px] lg:flex-row lg:items-end">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cdn.prod.website-files.com/6523c202a6a9763a268a7a7d/69d8eb3622c77fc93875d989_logo-zerogo-black.png"
              alt="ZEROGO"
              className="w-[140px]"
              referrerPolicy="no-referrer"
            />
            <div className="mt-3.5 text-[16px] leading-[26.4px] text-[#666]">
              품절 위험을 먼저 감지하고,
              <br />
              오늘의 발주 판단과 재고 보충 알림을 정리해주는 서비스
            </div>
          </div>
          <div className="text-left text-[13px] leading-[23.4px] text-[#777] lg:text-right">
            <div>(주) 뭉클랩 | 대표이사 : 윤도선 | 사업자등록번호 : 488-88-02579</div>
            <div>주소 : 경기도 고양시 일산동구 무궁화로 20-38(로데오탑빌딩), 502호</div>
            <div>고객문의 : zerogo@moonklabs.com</div>
            <div className="mt-3 font-extrabold text-[#111]">
              © Moonklabs Co., Ltd. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
