"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Bell,
  BarChart3,
  Clock,
  ChevronDown,
  ShieldCheck,
  MousePointer2,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  LOGO_URL,
  HERO_IMAGE_URL,
  APP_URL_PROD,
  APP_URL_DEV,
  FAQ_ITEMS,
} from "@/lib/site";
import { SiteHeader } from "@/app/_components/BlogChrome";

export default function HomeClient() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [appUrl, setAppUrl] = useState(APP_URL_PROD);

  // Hydration-safe app URL resolution
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (
        hostname.includes("localhost") ||
        hostname.includes("127.0.0.1") ||
        hostname.includes("dev")
      ) {
        setAppUrl(APP_URL_DEV);
      } else {
        setAppUrl(APP_URL_PROD);
      }
    }
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.1 },
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-[#363636] selection:text-white">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="mb-6 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-sm font-medium text-black">
                쿠팡 로켓그로스 셀러 전용
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-black sm:text-6xl lg:text-7xl leading-[1.3] sm:leading-tight">
                로켓그로스 품절 전에,<br />
                <span className="text-brand">오늘 발주할 상품을 확인하세요</span>
              </h1>
              <p className="mx-auto mt-6 max-w-4xl text-base sm:text-xl lg:text-[18pt] leading-relaxed text-black/80">
                쿠팡 Wing과 엑셀을 오가며 계산하지 않아도 됩니다.
                <br />
                오늘 발주할 상품과 추천 수량을 우선순위로 정리합니다.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                <a
                  href={appUrl}
                  className="group inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-brand px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg font-semibold text-white transition hover:opacity-90"
                >
                  오늘 발주할 상품 확인하기
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition group-hover:translate-x-1" />
                </a>
                <a
                  href="#guide"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg font-semibold text-black transition hover:bg-neutral-50"
                >
                  재고 운영 가이드 보기
                </a>
              </div>
            </motion.div>

            <motion.div
              className="mt-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
            >
              <div className="relative mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl sm:p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Zerogo Dashboard Preview"
                    className="w-full rounded-xl shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -top-6 -right-6 hidden h-24 w-24 rounded-full bg-neutral-100/50 blur-3xl lg:block"></div>
                <div className="absolute -bottom-10 -left-10 hidden h-40 w-40 rounded-full bg-neutral-100/50 blur-3xl lg:block"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="bg-neutral-50 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black/40">
                The Problem
              </h2>
              <p className="mt-3 text-2xl font-bold tracking-tight text-black sm:mt-4 sm:text-4xl">
                이미 놓치고 있을 수 있습니다
              </p>
            </div>

            <motion.div
              className="grid gap-8 md:grid-cols-3"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
            >
              {[
                {
                  icon: <Zap className="h-6 w-6 text-brand" />,
                  title: "갑자기 품절됩니다",
                  description:
                    "어제까지 괜찮던 상품도 주문 속도가 갑자기 올라가면 순식간에 품절됩니다.",
                },
                {
                  icon: <Clock className="h-6 w-6 text-brand" />,
                  title: "발주 타이밍을 놓칩니다",
                  description:
                    "재고 숫자는 봤는데 언제 발주해야 하는지 확신이 없어서 결국 늦습니다.",
                },
                {
                  icon: <AlertTriangle className="h-6 w-6 text-brand" />,
                  title: "매일 직접 확인해야 합니다",
                  description:
                    "쿠팡, 엑셀, 메모를 계속 열어봐야 안심되는 구조는 이미 비효율입니다.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 transition hover:shadow-lg"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50 sm:mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-black/90">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-black/70 sm:mt-4">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Core Insight Section */}
        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <motion.div {...fadeIn}>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black/40">
                  Core Insight
                </h2>
                <p className="mt-3 text-2xl font-bold tracking-tight text-black sm:mt-4 sm:text-4xl">
                  문제는 재고가 아닙니다
                </p>
                <p className="mt-5 text-base sm:text-lg leading-relaxed text-black/80 sm:mt-6">
                  진짜 문제는 재고 수량을 모르는 것이 아니라,{" "}
                  <span className="font-semibold text-black underline decoration-neutral-200 underline-offset-4">
                    언제 발주해야 하는지 확신이 없다는 것
                  </span>
                  입니다.
                </p>
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-black/80 sm:mt-4">
                  ZEROGO는 재고를 보여주는 대신 오늘 봐야 할 상품, 예상 품절일,
                  발주 마감일, 지금 해야 할 액션을 먼저 정리합니다.
                </p>

                <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-black/40">
                    계산 예시
                  </div>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-black/80">
                    현재 추정 재고{" "}
                    <span className="font-bold text-black">120개</span>, 최근 7일
                    평균 판매가{" "}
                    <span className="font-bold text-black">하루 15개</span>라면 약{" "}
                    <span className="font-bold text-black">8일 뒤</span> 품절됩니다.
                    발주 후 입고까지{" "}
                    <span className="font-bold text-black">5일</span>이 걸린다면,
                    발주 마감일은{" "}
                    <span className="font-bold text-brand">
                      오늘로부터 3일 이내
                    </span>
                    입니다.
                  </p>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-black/55">
                    ZEROGO는 이 계산을 모든 SKU에 대해 매일 자동으로 수행해, 오늘
                    발주해야 할 상품만 추려서 보여줍니다.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="grid gap-4"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="rounded-3xl border border-neutral-100 bg-neutral-50 p-6 sm:p-8">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-black/40">
                    기존 방식
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-bold text-black/20 line-through">
                    재고를 보여줍니다
                  </div>
                </div>
                <div className="rounded-3xl border border-neutral-900 bg-[#363636] p-6 text-white shadow-xl sm:p-8">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-brand">
                    ZEROGO AI AGENT
                  </div>
                  <div className="mt-2 text-xl sm:text-2xl font-bold">
                    오늘 해야 할 행동을 알려줍니다
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-neutral-400">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    판단과 실행 중심의 AI 에이전트
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="how" className="bg-neutral-50 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center sm:mb-16">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black/40">
                How it works
              </h2>
              <p className="mt-3 text-2xl font-bold tracking-tight text-black sm:mt-4 sm:text-4xl">
                데이터를 쌓는 게 아니라,
                <br className="sm:hidden" /> 오늘의 판단을 줄입니다
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              <motion.div
                variants={fadeIn}
                initial="initial"
                whileInView="whileInView"
                className="col-span-1 md:col-span-2 lg:col-span-2 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 sm:mb-6">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                </div>
                <h3 className="text-xl font-bold text-black sm:text-2xl">
                  AI 발주 판단 엔진
                </h3>
                <p className="mt-3 text-sm text-black/70 max-w-md sm:mt-4 sm:text-base">
                  AI 에이전트가 현재 추정 재고, 판매량 예측 연동, 품절 예상일,
                  발주 마감일을 분석하여 위험도를 자동으로 분류합니다.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-4 sm:gap-4">
                  {[
                    "현재 추정 재고",
                    "최근 판매 속도",
                    "예상 품절일",
                    "발주 마감일",
                  ].map((tag, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-neutral-100 bg-neutral-50 px-2.5 py-1.5 text-center text-[11px] font-semibold text-black/80 sm:px-3 sm:py-2 sm:text-xs"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={fadeIn}
                initial="initial"
                whileInView="whileInView"
                className="rounded-3xl border border-neutral-800 bg-[#363636] p-6 shadow-xl sm:p-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/20 sm:mb-6">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                </div>
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  스파이크 감지
                </h3>
                <p className="mt-3 text-sm text-white/70 sm:mt-4 sm:text-base">
                  주문 속도 급증을 실시간으로 감지하고 재계산을 트리거하여 긴급
                  알림을 보냅니다.
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                initial="initial"
                whileInView="whileInView"
                className="rounded-3xl border border-neutral-800 bg-[#363636] p-6 shadow-xl sm:p-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/20 sm:mb-6">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                </div>
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  Push + Workspace
                </h3>
                <p className="mt-3 text-sm text-white/70 sm:mt-4 sm:text-base">
                  카카오 알림과 데스크탑 웹 워크스페이스를 통해 우선순위 큐를
                  제공합니다.
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                initial="initial"
                whileInView="whileInView"
                className="col-span-1 md:col-span-2 lg:col-span-2 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 sm:mb-6">
                  <MousePointer2 className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                </div>
                <h3 className="text-xl font-bold text-black sm:text-2xl">
                  최소 액션 로깅
                </h3>
                <p className="mt-3 text-sm text-black/70 max-w-md sm:mt-4 sm:text-base">
                  확인 완료, 오늘은 보류, 발주 완료 등 복잡한 관리 없이 클릭
                  한 번으로 판단을 기록하세요.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
                  <div className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand sm:px-4 sm:py-2 sm:text-sm">
                    확인 완료
                  </div>
                  <div className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-black/80 sm:px-4 sm:py-2 sm:text-sm">
                    오늘은 보류
                  </div>
                  <div className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-black/80 sm:px-4 sm:py-2 sm:text-sm">
                    발주 완료
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Guide Section (FAQ) */}
        <section id="guide" className="py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center sm:mb-16">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black/40">
                Guide
              </h2>
              <p className="mt-3 text-2xl font-bold tracking-tight text-black sm:mt-4 sm:text-4xl">
                재고 운영 가이드
              </p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((faq, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-neutral-200"
                >
                  <button
                    className="flex w-full items-center justify-between bg-white p-5 text-left text-sm font-bold text-black/90 transition hover:bg-neutral-50 sm:p-6 sm:text-base"
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  >
                    {faq.q}
                    <ChevronDown
                      className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ml-4 text-neutral-400 transition-transform ${
                        activeFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeFaq === i && (
                    <div className="border-t border-neutral-100 bg-neutral-50 p-5 text-sm leading-relaxed text-black/70 sm:p-6 sm:text-base">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="bg-[#363636] py-20 lg:py-32">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/30 p-8 text-center shadow-2xl sm:p-16">
              <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-brand/10 blur-3xl"></div>
              <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-brand/10 blur-3xl"></div>

              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                  이미 늦었을 수 있습니다
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                  다음 품절은 재고 숫자를 못 봐서가 아니라 발주 타이밍을 놓쳐서
                  발생합니다.
                  <br />
                  지금 ZEROGO를 시작하고 오늘 발주할 상품을 즉시 확인하세요.
                </p>

                <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
                  <a
                    href={appUrl}
                    className="group inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-brand px-8 py-4 text-base sm:text-lg font-semibold text-white transition hover:opacity-90 shadow-lg shadow-brand/20"
                  >
                    지금 무료로 시작하기
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition group-hover:translate-x-1" />
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 sm:mt-10">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
                    간편한 로켓그로스 연동
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
                    실시간 품절 위험 감지
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 sm:space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_URL}
                alt="ZEROGO"
                className="h-5 w-auto sm:h-6 lg:h-8"
                referrerPolicy="no-referrer"
              />
              <p className="text-xs sm:text-sm leading-relaxed text-black/80">
                재고를 보여주는 도구가 아니라, 품절 위험을 먼저 감지하
                <br className="hidden sm:block" />
                고 오늘의 발주 판단을 정리해주는 AI 에이전트
              </p>
            </div>

            <div className="text-left lg:text-right space-y-1 text-[11px] sm:text-xs text-black/70">
              <p>
                <span className="font-bold text-black/90">(주) 뭉클랩</span> |
                대표이사 : 윤도선 | 사업자등록번호 : 488-88-02579
              </p>
              <p>
                주소 : 경기도 고양시 일산동구 무궁화로 20-38(로데오탑빌딩),
                502호
              </p>
              <p>고객문의 : sellerking@moonklabs.com</p>
              <p className="mt-3 sm:mt-4 font-bold text-black/90">
                @ Moongclelabs Co., Ltd. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
