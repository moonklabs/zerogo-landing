/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  MousePointer2
} from "lucide-react";
import { useState, FormEvent } from "react";

const LOGO_URL = "https://cdn.prod.website-files.com/6523c202a6a9763a268a7a7d/69d8eb3622c77fc93875d989_logo-zerogo-black.png";
const HERO_IMAGE_URL = "https://cdn.prod.website-files.com/6523c202a6a9763a268a7a7d/69d9151e0bd35c9af78cd437_hero-img.png";

export default function App() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", channel: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.channel) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://zerogo-apply-api.sellerking.workers.dev/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ name: "", email: "", channel: "" });
      } else {
        const data = await response.json();
        setError(data.error || "신청 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setError("서버와의 통신 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.1 }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-[#363636] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center">
            <a href="#" className="shrink-0">
              <img src={LOGO_URL} alt="Zerogo" className="h-6 w-auto sm:h-7 lg:h-8" referrerPolicy="no-referrer" />
            </a>
          </div>
          
          <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-black md:flex">
            <a href="#problem" className="transition hover:opacity-70">문제</a>
            <a href="#how" className="transition hover:opacity-70">작동 방식</a>
            <a href="#guide" className="transition hover:opacity-70">가이드</a>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-4">
            <a href="#cta" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              사전 신청하기
            </a>
          </div>
        </div>
      </header>

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
                재고를 보여주는 도구가 아닙니다
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-black sm:text-6xl lg:text-7xl leading-[1.3] sm:leading-tight">
                쿠팡을 안 봐도,<br />
                <span className="text-brand">AI가 품절을 막습니다</span>
              </h1>
              <p className="mx-auto mt-6 max-w-4xl text-base sm:text-xl lg:text-[18pt] leading-relaxed text-black/80">
                오늘 발주해야 할 상품을 ZEROGO AI 에이전트가 먼저 알려드립니다. <br />
                재고 숫자를 나열이 아닌, 스스로 판단하고 실행해서 품절을 방지합니다.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                <a href="#cta" className="group inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-brand px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg font-semibold text-white transition hover:opacity-90">
                  지금 품절 위험 확인하기
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition group-hover:translate-x-1" />
                </a>
                <a href="#guide" className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg font-semibold text-black transition hover:bg-neutral-50">
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
                  <img 
                    src={HERO_IMAGE_URL} 
                    alt="Zerogo Dashboard Preview" 
                    className="w-full rounded-xl shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Decorative elements */}
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
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black/40">The Problem</h2>
              <p className="mt-3 text-2xl font-bold tracking-tight text-black sm:mt-4 sm:text-4xl">이미 놓치고 있을 수 있습니다</p>
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
                  description: "어제까지 괜찮던 상품도 주문 속도가 갑자기 올라가면 순식간에 품절됩니다."
                },
                {
                  icon: <Clock className="h-6 w-6 text-brand" />,
                  title: "발주 타이밍을 놓칩니다",
                  description: "재고 숫자는 봤는데 언제 발주해야 하는지 확신이 없어서 결국 늦습니다."
                },
                {
                  icon: <AlertTriangle className="h-6 w-6 text-brand" />,
                  title: "매일 직접 확인해야 합니다",
                  description: "쿠팡, 엑셀, 메모를 계속 열어봐야 안심되는 구조는 이미 비효율입니다."
                }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  variants={fadeIn}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 transition hover:shadow-lg"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50 sm:mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-black/90">{item.title}</h3>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-black/70 sm:mt-4">{item.description}</p>
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
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black/40">Core Insight</h2>
                <p className="mt-3 text-2xl font-bold tracking-tight text-black sm:mt-4 sm:text-4xl">문제는 재고가 아닙니다</p>
                <p className="mt-5 text-base sm:text-lg leading-relaxed text-black/80 sm:mt-6">
                  진짜 문제는 재고 수량을 모르는 것이 아니라, <span className="font-semibold text-black underline decoration-neutral-200 underline-offset-4">언제 발주해야 하는지 확신이 없다는 것</span>입니다.
                </p>
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-black/80 sm:mt-4">
                  ZEROGO는 재고를 보여주는 대신 오늘 봐야 할 상품, 예상 품절일, 발주 마감일, 지금 해야 할 액션을 먼저 정리합니다.
                </p>
              </motion.div>
              
              <motion.div 
                className="grid gap-4"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="rounded-3xl border border-neutral-100 bg-neutral-50 p-6 sm:p-8">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-black/40">기존 방식</div>
                  <div className="mt-2 text-xl sm:text-2xl font-bold text-black/20 line-through">재고를 보여줍니다</div>
                </div>
                <div className="rounded-3xl border border-neutral-900 bg-[#363636] p-6 text-white shadow-xl sm:p-8">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-brand">ZEROGO AI AGENT</div>
                  <div className="mt-2 text-xl sm:text-2xl font-bold">오늘 해야 할 행동을 알려줍니다</div>
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
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black/40">How it works</h2>
              <p className="mt-3 text-2xl font-bold tracking-tight text-black sm:mt-4 sm:text-4xl">데이터를 쌓는 게 아니라,<br className="sm:hidden" /> 오늘의 판단을 줄입니다</p>
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
                <h3 className="text-xl font-bold text-black sm:text-2xl">AI 발주 판단 엔진</h3>
                <p className="mt-3 text-sm text-black/70 max-w-md sm:mt-4 sm:text-base">AI 에이전트가 현재 추정 재고, 판매량 예측 연동, 품절 예상일, 발주 마감일을 분석하여 위험도를 자동으로 분류합니다.</p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-4 sm:gap-4">
                  {['현재 추정 재고', '최근 판매 속도', '예상 품절일', '발주 마감일'].map((tag, i) => (
                    <div key={i} className="rounded-xl border border-neutral-100 bg-neutral-50 px-2.5 py-1.5 text-center text-[11px] font-semibold text-black/80 sm:px-3 sm:py-2 sm:text-xs">
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
                <h3 className="text-xl font-bold text-white sm:text-2xl">스파이크 감지</h3>
                <p className="mt-3 text-sm text-white/70 sm:mt-4 sm:text-base">주문 속도 급증을 실시간으로 감지하고 재계산을 트리거하여 긴급 알림을 보냅니다.</p>
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
                <h3 className="text-xl font-bold text-white sm:text-2xl">Push + Workspace</h3>
                <p className="mt-3 text-sm text-white/70 sm:mt-4 sm:text-base">카카오 알림과 데스크탑 웹 워크스페이스를 통해 우선순위 큐를 제공합니다.</p>
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
                <h3 className="text-xl font-bold text-black sm:text-2xl">최소 액션 로깅</h3>
                <p className="mt-3 text-sm text-black/70 max-w-md sm:mt-4 sm:text-base">확인 완료, 오늘은 보류, 발주 완료 등 복잡한 관리 없이 클릭 한 번으로 판단을 기록하세요.</p>
                <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
                  <div className="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand sm:px-4 sm:py-2 sm:text-sm">확인 완료</div>
                  <div className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-black/80 sm:px-4 sm:py-2 sm:text-sm">오늘은 보류</div>
                  <div className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-black/80 sm:px-4 sm:py-2 sm:text-sm">발주 완료</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Guide Section (FAQ) */}
        <section id="guide" className="py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center sm:mb-16">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black/40">Guide</h2>
              <p className="mt-3 text-2xl font-bold tracking-tight text-black sm:mt-4 sm:text-4xl">재고 운영 가이드</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "재고 관리는 왜 어려운가요?",
                  a: "재고 관리가 어려운 이유는 단순히 수량을 아는 것이 아니라 언제 발주해야 하는지를 판단해야 하기 때문입니다. ZEROGO는 현재 추정 재고와 판매 속도를 바탕으로 발주 타이밍을 먼저 알려줍니다."
                },
                {
                  q: "품절을 막는 가장 중요한 방법은 무엇인가요?",
                  a: "품절을 막기 위해 가장 중요한 것은 재고를 보는 것이 아니라 품절되기 전에 발주 타이밍을 잡는 것입니다. ZEROGO는 예상 품절일과 발주 마감일을 계산해 먼저 알려줍니다."
                },
                {
                  q: "기존 재고 관리 프로그램과 ZEROGO의 차이는 무엇인가요?",
                  a: "기존 재고 관리 프로그램은 현재 재고를 보여주는 도구에 가깝습니다. ZEROGO는 오늘 발주해야 할 상품을 먼저 알려주는 품절 방지 AI 에이전트입니다."
                },
                {
                  q: "쿠팡 재고를 매일 확인해야 하나요?",
                  a: "대부분의 셀러는 불안해서 매일 쿠팡에 들어가 재고를 확인합니다. ZEROGO는 위험 상품을 먼저 알려주기 때문에 직접 확인해야 하는 부담을 줄여줍니다."
                }
              ].map((faq, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-neutral-200">
                  <button 
                    className="flex w-full items-center justify-between bg-white p-5 text-left text-sm font-bold text-black/90 transition hover:bg-neutral-50 sm:p-6 sm:text-base"
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  >
                    {faq.q}
                    <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ml-4 text-neutral-400 transition-transform ${activeFaq === i ? "rotate-180" : ""}`} />
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                    이미 늦었을 수 있습니다
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-white/70 sm:mt-6 sm:text-lg">
                    다음 품절은 재고 숫자를 못 봐서가 아니라 발주 타이밍을 놓쳐서 발생합니다. ZEROGO AI 에이전트가 오늘 위험한 상품을 먼저 알려드리겠습니다.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4 sm:mt-10 sm:gap-6">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                      <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
                      무료 사전 신청
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
                      실시간 감지
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                  {isSuccess ? (
                    <div className="py-10 text-center sm:py-12">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 sm:mb-6">
                        <CheckCircle2 className="h-10 w-10 text-brand" />
                      </div>
                      <h3 className="text-xl font-bold text-black sm:text-2xl">신청되셨습니다.</h3>
                      <p className="mt-3 text-sm leading-relaxed text-black/60 sm:mt-4 sm:text-lg">
                        고객지원팀이 순차적으로 연락드리겠습니다.<br />
                        감사합니다.
                      </p>
                      <button 
                        onClick={() => setIsSuccess(false)}
                        className="mt-8 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition hover:opacity-90 sm:mt-10 sm:py-4 sm:text-base"
                      >
                        확인
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-black sm:text-xl">무료 사전 신청</h3>
                      <p className="mt-2 text-xs text-black/40 sm:text-sm">내 상품의 위험도를 먼저 확인하세요.</p>
                      <form className="mt-6 space-y-3 sm:mt-8 sm:space-y-4" onSubmit={handleSubmit}>
                        <div>
                          <input 
                            type="text" 
                            placeholder="이름 또는 회사명" 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm outline-none transition focus:border-black focus:bg-white text-black sm:px-4"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <input 
                            type="email" 
                            placeholder="이메일 주소" 
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition focus:bg-white text-black sm:px-4 ${
                              error && !validateEmail(formData.email) && formData.email ? "border-red-500 bg-red-50" : "border-neutral-200 bg-neutral-50 focus:border-black"
                            }`}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <input 
                            type="text" 
                            placeholder="운영 중인 채널 (예: 쿠팡 로켓그로스)" 
                            value={formData.channel}
                            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm outline-none transition focus:border-black focus:bg-white text-black sm:px-4"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        {error && (
                          <p className="text-xs font-medium text-red-500">{error}</p>
                        )}

                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 sm:py-4 sm:text-base"
                        >
                          {isSubmitting ? "신청 중..." : "사전 신청하기"}
                        </button>
                      </form>
                    </>
                  )}
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
              <img src={LOGO_URL} alt="ZEROGO" className="h-5 w-auto sm:h-6 lg:h-8" referrerPolicy="no-referrer" />
              <p className="text-xs sm:text-sm leading-relaxed text-black/80">
                재고를 보여주는 도구가 아니라, 품절 위험을 먼저 감지하<br className="hidden sm:block" />
                고 오늘의 발주 판단을 정리해주는 AI 에이전트
              </p>
            </div>
            
            <div className="text-left lg:text-right space-y-1 text-[11px] sm:text-xs text-black/70">
              <p><span className="font-bold text-black/90">(주) 뭉클랩</span> | 대표이사 : 윤도선 | 사업자등록번호 : 488-88-02579</p>
              <p>주소 : 경기도 고양시 일산동구 무궁화로 20-38(로데오탑빌딩), 502호</p>
              <p>고객문의 : sellerking@moonklabs.com</p>
              <p className="mt-3 sm:mt-4 font-bold text-black/90">@ Moongclelabs Co., Ltd. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
