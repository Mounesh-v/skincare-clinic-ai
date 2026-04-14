import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import { getTopDoctors } from "../../data/doctors";

<<<<<<< HEAD
// ─── constants ───────────────────────────────────────────────────────────────

const SCORE_KEYS = ["oily", "dry", "normal", "combination"];

const SCORE_CONFIG = {
  oily: {
    label: "Oil Level",
    barClass: "bg-gradient-to-r from-yellow-400 to-amber-500",
    textClass: "text-yellow-300",
    bgClass: "bg-yellow-400/8",
    borderClass: "border-yellow-400/20",
  },
  dry: {
    label: "Dryness",
    barClass: "bg-gradient-to-r from-orange-400 to-red-500",
    textClass: "text-orange-300",
    bgClass: "bg-orange-400/8",
    borderClass: "border-orange-400/20",
  },
  normal: {
    label: "Balance",
    barClass: "bg-gradient-to-r from-emerald-400 to-teal-500",
    textClass: "text-emerald-300",
    bgClass: "bg-emerald-400/8",
    borderClass: "border-emerald-400/20",
  },
  combination: {
    label: "Mixed Zone",
    barClass: "bg-gradient-to-r from-purple-400 to-violet-500",
    textClass: "text-purple-300",
    bgClass: "bg-purple-400/8",
    borderClass: "border-purple-400/20",
  },
};

const SKIN_TYPE_CONFIG = {
  normal: {
    subtitle: "Your skin is naturally balanced with healthy moisture levels",
    gradient: "from-emerald-700 via-teal-800 to-cyan-900",
    accent: "emerald",
    badge: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  },
  oily: {
    subtitle: "Your skin produces excess sebum, especially in the T-zone",
    gradient: "from-amber-700 via-yellow-800 to-orange-900",
    accent: "amber",
    badge: "bg-yellow-500/20 text-yellow-200 border-yellow-400/40",
  },
  dry: {
    subtitle: "Your skin needs extra hydration and barrier support",
    gradient: "from-orange-700 via-rose-800 to-red-900",
    accent: "orange",
    badge: "bg-orange-500/20 text-orange-200 border-orange-400/40",
  },
  combination: {
    subtitle: "Your T-zone is oily while cheeks tend to stay drier",
    gradient: "from-purple-700 via-violet-800 to-indigo-900",
    accent: "purple",
    badge: "bg-purple-500/20 text-purple-200 border-purple-400/40",
  },
};

// ─── helpers ─────────────────────────────────────────────────────────────────

=======
const SCORE_KEYS = ["oily", "dry", "normal", "combination"];

>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
const formatPercent = (value) => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return "0%";
  return `${Math.round(Math.max(0, Math.min(1, num)) * 100)}%`;
};

const toScoreRows = (scores) => {
  const src = scores && typeof scores === "object" ? scores : {};
  return SCORE_KEYS.map((key) => ({ key, value: Number(src[key] || 0) }));
};

const toRecommendations = (analysis) => {
  if (!analysis || typeof analysis !== "object") return [];
  if (Array.isArray(analysis.recommendations)) return analysis.recommendations;
  if (Array.isArray(analysis.plan)) return analysis.plan;
  if (Array.isArray(analysis.advice)) return analysis.advice;
  return [];
};

const normalizeProductArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const recommendationTitle = (item) => {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "Recommendation";
  return String(item.title || item.summary || "Recommendation");
};

const recommendationSummary = (item) => {
  if (typeof item === "string") return "Follow this recommendation in your daily routine.";
  if (!item || typeof item !== "object") return "";
  return String(item.summary || "");
};

<<<<<<< HEAD
// Fix UTF-8 encoding artifacts that appear in old cached responses
const cleanText = (text) =>
  String(text || "")
    .replace(/ΓåÆ/g, "\u2192")
    .replace(/ΓÇö/g, "\u2014")
    .replace(/Γö[A-Za-z0-9]*/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

// Age-aware display label mapping — only affects rendered text, not scores/logic
const applyAgeLabelMap = (text, age) => {
  const n = parseInt(age || "0", 10);
  if (n > 0 && n < 35) {
    return String(text).replace(/\bwrinkles?\b/gi, "Fine Lines / Texture");
  }
  return String(text);
};

// Convert enriched explanation paragraph into bullet array + summary line
const parseExplanationBullets = (text) => {
  const clean = cleanText(text);
  const parts = clean.split(/\.\s+/).filter(Boolean);
  const bullets = [];
  let summary = "";
  for (const part of parts) {
    if (/^overall classification/i.test(part)) {
      summary = part.replace(/^overall classification:\s*/i, "");
    } else if (part.includes("\u2192") || part.includes("tendency") || part.includes("signal")) {
      bullets.push(part.trim());
    } else if (part.trim()) {
      bullets.push(part.trim());
    }
  }
  return { bullets, summary };
};

const getRecommendationIcon = (title) => {
  const t = String(title || "").toLowerCase();
  if (t.includes("clean")) return "🧴";
  if (t.includes("moistur") || t.includes("hydrat")) return "💧";
  if (t.includes("sun") || t.includes("spf") || t.includes("protect")) return "☀️";
  if (t.includes("tone") || t.includes("toner")) return "🌿";
  if (t.includes("serum") || t.includes("vitamin")) return "✨";
  if (t.includes("exfoli") || t.includes("scrub") || t.includes("aha") || t.includes("bha")) return "🔬";
  if (t.includes("eye")) return "👁️";
  if (t.includes("mask")) return "🎭";
  if (t.includes("retinol") || t.includes("retinoid")) return "🌙";
  if (t.includes("oil")) return "💫";
  if (t.includes("water") || t.includes("drink")) return "🥤";
  return "🌿";
};

const getRecommendationTag = (title) => {
  const t = String(title || "").toLowerCase();
  if (t.includes("morning") || t.includes("sunscreen") || t.includes("spf") || t.includes(" am")) return "Morning";
  if (t.includes("night") || t.includes("retinol") || t.includes("overnight") || t.includes(" pm")) return "Night";
  return "Morning & Night";
};

// ─── component ───────────────────────────────────────────────────────────────

=======
>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
const Results = ({ assessmentData }) => {
  const navigate = useNavigate();
  const lead = assessmentData?.lead || {};
  const answers = assessmentData?.answers || {};
  const analysis = assessmentData?.analysis || {};
  const response = analysis;
  const image = assessmentData?.image;
<<<<<<< HEAD
  const userAge = lead.age || answers.age || "";

  // ── response fields — DO NOT recompute skin_type from scores ──────────────
=======

>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
  const predictedTypeRaw = String(response.skin_type || "Unknown");
  const predictedType = predictedTypeRaw.replace(/^./, (c) => c.toUpperCase());
  const skinType = predictedType;
  const skinTypeKey = predictedType.toLowerCase().trim();
  const confidence = formatPercent(response.confidence);
  const confidenceLevel = String(response.confidence_level || "");
<<<<<<< HEAD
  const explanation = String(response.enriched_explanation || response.explanation || "");
=======
  const explanation = String(response.enriched_explanation || response.explanation || "No explanation available.");
>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
  const scores = toScoreRows(response.scores);
  const recommendations = toRecommendations(response);
  const top2Gap = Number(response.top2_gap);

<<<<<<< HEAD
  // ── derived display ───────────────────────────────────────────────────────
  const typeConfig = SKIN_TYPE_CONFIG[skinTypeKey] || {
    subtitle: "Your skin profile has been analyzed by our AI",
    gradient: "from-slate-700 via-slate-800 to-slate-900",
    accent: "teal",
    badge: "bg-slate-500/20 text-slate-200 border-slate-400/40",
  };

  const secondaryType = useMemo(() => {
    if (!scores.length) return null;
    const sorted = [...scores].sort((a, b) => b.value - a.value);
    const second = sorted[1]?.key
      ? String(sorted[1].key).replace(/^./, (c) => c.toUpperCase())
      : null;
    return second && second.toLowerCase() !== skinTypeKey ? second : null;
  }, [scores, skinTypeKey]);

  const { bullets: explanationBullets, summary: explanationSummary } = useMemo(
    () => parseExplanationBullets(explanation),
    [explanation],
  );

  const confidenceBadgeClass =
    confidenceLevel === "Strong"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/40"
      : confidenceLevel === "Moderate"
        ? "bg-amber-500/15 text-amber-200 border-amber-400/40"
        : confidenceLevel === "Low"
          ? "bg-rose-500/15 text-rose-200 border-rose-400/40"
          : "bg-slate-500/15 text-slate-200 border-slate-400/40";

  const personalizedInsight = useMemo(() => {
    const age = parseInt(lead.age || answers.age || "0", 10);
    const gender = String(lead.gender || answers.gender || "").toLowerCase();
    const lines = [];

    if (age > 0) {
      if (age < 20)
        lines.push("Teen skin is most reactive to hormonal changes. A simple 3-step routine — gentle cleanser, lightweight moisturizer, SPF — is all you need right now.");
      else if (age < 25)
        lines.push("Your skin is in its most resilient phase. Consistent SPF and light hydration now builds a strong foundation that you'll thank yourself for in 10 years.");
      else if (age < 35)
        lines.push("Moisture retention naturally decreases through your late 20s and 30s. A hyaluronic acid serum applied on damp skin before moisturizer makes a visible difference.");
      else if (age < 45)
        lines.push("Collagen production slows significantly after 35. Incorporating antioxidant serums (vitamin C in the morning) and nightly retinol can visibly slow early aging.");
      else
        lines.push("Mature skin responds best to barrier-repairing ingredients: ceramides, peptides, and squalane. Focus on rich, nourishing formulas and never skip SPF.");
    }

    if (gender === "male")
      lines.push("Male skin is ~25% thicker and produces more sebum than female skin. A targeted gentle cleanser and a non-greasy SPF 30+ keeps pores clear and prevents premature aging.");
    else if (gender === "female")
      lines.push("Hormonal fluctuations affect skin clarity week-to-week. A consistent core routine — adapting intensity rather than swapping products — works best long-term.");

    if (skinTypeKey === "normal")
      lines.push("Normal skin is the easiest type to maintain. Protect it with SPF daily and avoid stripping it with harsh actives — less is more for balanced skin.");
    else if (skinTypeKey === "oily")
      lines.push("Oily skin actually ages more slowly due to higher natural moisture. The goal isn't to eliminate oil — it's to regulate it with BHA exfoliants and niacinamide.");
    else if (skinTypeKey === "dry")
      lines.push("Dry skin benefits most from product layering: hydrating toner → serum → moisturizer → facial oil (night only). Never skip SPF — UV damage worsens dryness.");
    else if (skinTypeKey === "combination")
      lines.push("Combination skin needs zone-specific care: a lightweight gel-moisturizer on the T-zone, a richer cream on cheeks. Multi-masking once a week is highly effective.");

    return lines;
  }, [lead, answers, skinTypeKey]);

  // ── products + doctors ────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const doctors = useMemo(() => getTopDoctors(skinTypeKey, 3), [skinTypeKey]);

  // ── bar animation trigger ─────────────────────────────────────────────────
  // Reset on every new assessmentData so bars animate in fresh for each scan.
  const [barsVisible, setBarsVisible] = useState(false);
  useEffect(() => {
    setBarsVisible(false);
    const t = setTimeout(() => setBarsVisible(true), 250);
    return () => clearTimeout(t);
  }, [assessmentData]);

  useEffect(() => {
    console.log({ backend_type: response.skin_type, ui_type: predictedType });
=======
  const secondaryType = useMemo(() => {
    if (!scores.length) return "-";
    const sorted = [...scores].sort((a, b) => b.value - a.value);
    const second = sorted[1]?.key ? String(sorted[1].key).replace(/^./, (c) => c.toUpperCase()) : "-";
    // Don't show secondary when it's the same as the primary (redundant)
    return second.toLowerCase() === skinTypeKey ? "-" : second;
  }, [scores, skinTypeKey]);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const doctors = useMemo(() => getTopDoctors(skinTypeKey, 3), [skinTypeKey]);

  useEffect(() => {
    console.log({
      backend_type: response.skin_type,
      ui_type: predictedType,
    });
>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
  }, [response.skin_type, predictedType]);

  useEffect(() => {
    let mounted = true;
<<<<<<< HEAD
    setProductsLoading(true);
    productService
      .getAll({ skinType: skinTypeKey })
      .then((apiData) => {
        if (mounted) setProducts(normalizeProductArray(apiData).slice(0, 6));
      })
      .catch(() => {
        if (mounted) setProducts([]);
      })
      .finally(() => {
        if (mounted) setProductsLoading(false);
      });
=======

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const apiData = await productService.getAll({ skinType: skinTypeKey });
        const list = normalizeProductArray(apiData).slice(0, 6);
        if (mounted) {
          setProducts(list);
        }
      } catch (_error) {
        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();
>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
    return () => {
      mounted = false;
    };
  }, [skinTypeKey]);

<<<<<<< HEAD
  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070d18] px-4 py-6 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-4">

        {/* ── SECTION 1: HERO CARD ─────────────────────────────────────────── */}
        <section
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${typeConfig.gradient} p-7 shadow-2xl`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
              AI Skin Analysis Report
            </p>
            <h1 className="mt-2 text-5xl font-black tracking-tight text-white drop-shadow-lg sm:text-6xl">
              {skinType}
            </h1>
            <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-white/75">
              {typeConfig.subtitle}
            </p>

            {/* badges row */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${confidenceBadgeClass}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {confidence} confidence
                {confidenceLevel ? ` · ${confidenceLevel}` : ""}
              </span>
              {secondaryType && (
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/65">
                  Secondary: {secondaryType}
                </span>
              )}
            </div>

            {/* low confidence warning */}
            {Number.isFinite(top2Gap) && top2Gap < 0.1 && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
                <span className="mt-0.5 flex-shrink-0 text-base">⚠️</span>
                <p className="text-xs leading-relaxed text-amber-200">
                  <span className="font-semibold">Result confidence is slightly low.</span>{" "}
                  For a more accurate reading, retake the scan in natural daylight with your face
                  centred and well-lit.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 8: PROFILE STRIP ─────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center gap-4">
            {image ? (
              <img
                src={image}
                alt="Skin scan"
                className="h-20 w-20 flex-shrink-0 rounded-2xl border border-slate-600 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-3xl">
                👤
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-white">
                {lead.name || "User"}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(lead.age || answers.age) && (
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                    Age {lead.age || answers.age}
                  </span>
                )}
                {(lead.gender || answers.gender) && (
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs capitalize text-slate-300">
                    {lead.gender || answers.gender}
                  </span>
                )}
                <span
                  className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${typeConfig.badge}`}
                >
                  {skinType} Skin
                </span>
              </div>
              {(lead.phone || answers.phone) && (
                <p className="mt-1 text-xs text-slate-500">
                  {lead.phone || answers.phone}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: PERSONALIZED INSIGHT ─────────────────────────────── */}
        {personalizedInsight.length > 0 && (
          <section className="rounded-2xl border border-teal-500/20 bg-teal-950/25 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">🔬</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-300">
                Personalized Insight
              </h2>
            </div>
            <div className="space-y-2.5">
              {personalizedInsight.map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-slate-200">
                  {line}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 5: WHY THIS RESULT ───────────────────────────────────── */}
        {(explanationBullets.length > 0 || explanation) && (
          <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Why this result?
              </h2>
            </div>
            {explanationBullets.length > 0 ? (
              <ul className="space-y-2.5">
                {explanationBullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                    <span className="leading-relaxed">{applyAgeLabelMap(cleanText(bullet), userAge)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-slate-200">{applyAgeLabelMap(cleanText(explanation), userAge)}</p>
            )}
            {explanationSummary && (
              <div className="mt-4 border-t border-slate-700/60 pt-3">
                <p className="text-xs font-semibold text-teal-300">
                  {applyAgeLabelMap(cleanText(explanationSummary), userAge)}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── SECTION 4: SKIN SCORE BREAKDOWN ─────────────────────────────── */}
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Skin Score Breakdown
            </h2>
          </div>
          <div className="space-y-3">
            {scores.map((row) => {
              const cfg = SCORE_CONFIG[row.key] || SCORE_CONFIG.normal;
              return (
                <div
                  key={row.key}
                  className={`rounded-xl border p-3.5 ${cfg.borderClass} ${cfg.bgClass}`}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${cfg.textClass}`}>
                      {cfg.label}
                    </span>
                    <span className={`text-sm font-bold tabular-nums ${cfg.textClass}`}>
                      {formatPercent(row.value)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/30">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${cfg.barClass}`}
                      style={{ width: barsVisible ? formatPercent(row.value) : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 6: ROUTINE (PREMIUM) ─────────────────────────────────── */}
        {recommendations.length > 0 && (
          <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Your Skin Routine
              </h2>
            </div>
            <div className="space-y-3">
              {recommendations.map((item, idx) => {
                const title = recommendationTitle(item);
                const summary = recommendationSummary(item);
                const icon = getRecommendationIcon(title);
                const tag = getRecommendationTag(title);
                return (
                  <article
                    key={`${idx}-${title}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 transition-colors hover:bg-slate-800/70"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-700/80 text-xl shadow-sm">
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold leading-snug text-white">
                          {title}
                        </h3>
                        <span className="flex-shrink-0 rounded-md bg-teal-500/15 px-2 py-0.5 text-xs font-medium text-teal-300">
                          {tag}
                        </span>
                      </div>
                      {summary && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-400">{summary}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ── PRODUCTS ─────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Matched Products
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="text-xs font-semibold text-teal-400 transition-colors hover:text-teal-300"
            >
              View all →
=======
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-teal-500/30 bg-slate-900/70 p-6 shadow-2xl shadow-teal-900/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Personalized Assessment Report</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-white">{lead.name || "Your"}, your skin reboot starts now.</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Our AI analyzed your responses, lifestyle patterns, and skin photo to create an actionable care plan.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Predicted Skin Type</p>
            <h2 className="mt-2 text-5xl font-black text-teal-300">{skinType}</h2>
            <p className="mt-2 text-sm text-slate-300">
              Model confidence {confidence}
              {confidenceLevel ? (
                <span className={`ml-2 text-xs font-semibold ${confidenceLevel === "Strong" ? "text-teal-300" : confidenceLevel === "Moderate" ? "text-amber-300" : "text-rose-300"}`}>
                  ({confidenceLevel})
                </span>
              ) : null}
            </p>
            {secondaryType !== "-" && (
              <p className="mt-1 text-xs text-slate-400">Secondary signal: {secondaryType}</p>
            )}
            {Number.isFinite(top2Gap) && top2Gap < 0.1 ? (
              <p className="mt-2 inline-flex rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-200">
                Mixed / Low Confidence
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-relaxed text-slate-200">{explanation}</p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">User Profile</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              <li><span className="font-semibold">Name:</span> {lead.name || "-"}</li>
              <li><span className="font-semibold">Age:</span> {lead.age || answers.age || "-"}</li>
              <li><span className="font-semibold">Phone:</span> {lead.phone || answers.phone || "-"}</li>
              <li><span className="font-semibold">Gender:</span> {lead.gender || answers.gender || "-"}</li>
            </ul>
            {image && (
              <img
                src={image}
                alt="Submitted skin"
                className="mt-5 h-44 w-full rounded-xl border border-slate-700 object-cover"
              />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 className="text-lg font-bold text-white">Prediction Confidence</h3>
          <div className="mt-4 space-y-4">
            {scores.map((row) => (
              <div key={row.key}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-200">
                  <span className="capitalize">{row.key}</span>
                  <span>{formatPercent(row.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500" style={{ width: formatPercent(row.value) }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 className="text-lg font-bold text-white">AI Regimen Recommendations</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {recommendations.length > 0 ? (
              recommendations.map((item, idx) => (
                <article key={`${idx}-${recommendationTitle(item)}`} className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                  <h4 className="text-sm font-semibold text-teal-300">{recommendationTitle(item)}</h4>
                  <p className="mt-2 text-sm text-slate-200">{recommendationSummary(item)}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-300">No regimen recommendations available from this response.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Recommended Products for {skinType}</h3>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-lg border border-teal-500/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-teal-200 hover:bg-teal-500/10"
            >
              View All Products
>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
            </button>
          </div>

          {productsLoading ? (
<<<<<<< HEAD
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-52 animate-pulse rounded-xl bg-slate-800/70" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
=======
            <p className="mt-4 text-sm text-slate-300">Loading product matches...</p>
          ) : products.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
              {products.map((product) => {
                const id = product._id || product.id;
                const name = product.name || "Product";
                const price = product.price;
<<<<<<< HEAD
                const imageUrl =
                  product.image || product.imageUrl || product.thumbnail;
                const subtitle =
                  product.shortDescription ||
                  product.description ||
                  product.category ||
                  "";
                return (
                  <article
                    key={String(id || name)}
                    className="overflow-hidden rounded-xl border border-slate-700/40 bg-slate-800/40 transition-colors hover:bg-slate-800/70"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-slate-700/50 text-sm text-slate-500">
                        No image
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-white">{name}</h3>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                        {subtitle}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-teal-300">
                          {typeof price === "number" ? `Rs. ${price}` : "See details"}
                        </span>
                        {id && (
                          <button
                            type="button"
                            onClick={() => navigate(`/products/${id}`)}
                            className="rounded-lg bg-teal-500 px-3 py-1 text-xs font-semibold text-slate-900 transition-colors hover:bg-teal-400"
                          >
                            View
                          </button>
                        )}
                      </div>
=======
                const imageUrl = product.image || product.imageUrl || product.thumbnail;
                const subtitle = product.shortDescription || product.description || product.category || "";

                return (
                  <article key={String(id || name)} className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                    {imageUrl ? (
                      <img src={imageUrl} alt={name} className="h-36 w-full rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-36 items-center justify-center rounded-lg bg-slate-700 text-sm text-slate-300">No image</div>
                    )}
                    <h4 className="mt-3 text-sm font-semibold text-white">{name}</h4>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-300">{subtitle}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-teal-300">{typeof price === "number" ? `Rs. ${price}` : "See details"}</span>
                      {id ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${id}`)}
                          className="rounded-md bg-teal-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-teal-400"
                        >
                          Open
                        </button>
                      ) : null}
>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
<<<<<<< HEAD
            <p className="text-sm text-slate-400">
              No direct product matches found. Browse the full catalog for alternatives.
            </p>
          )}
        </section>

        {/* ── DOCTORS ──────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👨‍⚕️</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Top Specialist Matches
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/find-doctors")}
              className="text-xs font-semibold text-teal-400 transition-colors hover:text-teal-300"
            >
              Browse →
            </button>
          </div>
          {doctors.length > 0 ? (
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <article
                  key={doctor.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 transition-colors hover:bg-slate-800/70"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-xl">
                    👨‍⚕️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{doctor.name}</p>
                    <p className="text-xs text-teal-300">{doctor.specialty}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {doctor.location} · {doctor.experience}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs">
                      <span className="text-amber-400">⭐</span>
                      <span className="font-medium text-amber-300">{doctor.rating}</span>
                      <span className="text-slate-500">({doctor.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/find-doctors")}
                    className="flex-shrink-0 rounded-lg border border-teal-500/40 px-3 py-1.5 text-xs font-semibold text-teal-300 transition-colors hover:bg-teal-500/10"
=======
            <p className="mt-4 text-sm text-slate-300">No direct product matches found. Browse full catalog for alternatives.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Top Doctor Matches</h3>
            <button
              type="button"
              onClick={() => navigate("/find-doctors")}
              className="rounded-lg border border-teal-500/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-teal-200 hover:bg-teal-500/10"
            >
              Browse Doctors
            </button>
          </div>

          {doctors.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <article key={doctor.id} className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                  <h4 className="text-sm font-semibold text-white">{doctor.name}</h4>
                  <p className="mt-1 text-xs text-teal-300">{doctor.specialty}</p>
                  <p className="mt-2 text-xs text-slate-300">{doctor.location}</p>
                  <p className="mt-1 text-xs text-slate-300">{doctor.experience} experience</p>
                  <p className="mt-1 text-xs text-slate-300">Rating {doctor.rating} ({doctor.reviewCount} reviews)</p>
                  <button
                    type="button"
                    onClick={() => navigate("/find-doctors")}
                    className="mt-3 rounded-md bg-teal-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-teal-400"
>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
                  >
                    Consult
                  </button>
                </article>
              ))}
            </div>
          ) : (
<<<<<<< HEAD
            <p className="text-sm text-slate-400">
              No specialist matches found for this skin type.
            </p>
          )}
        </section>

        {/* ── SECTION 7: QUICK ACTIONS ─────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 backdrop-blur">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Quick Actions
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => navigate("/find-doctors")}
              className="flex flex-col items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/5 px-3 py-4 text-center transition-colors hover:bg-teal-500/15"
            >
              <span className="text-2xl">📋</span>
              <span className="text-xs font-semibold leading-tight text-teal-200">
                Improve my skin plan
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/assessment")}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-600/40 bg-slate-800/40 px-3 py-4 text-center transition-colors hover:bg-slate-700/60"
            >
              <span className="text-2xl">📸</span>
              <span className="text-xs font-semibold leading-tight text-slate-200">
                Retake scan
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-600/40 bg-slate-800/40 px-3 py-4 text-center transition-colors hover:bg-slate-700/60"
            >
              <span className="text-2xl">🛍️</span>
              <span className="text-xs font-semibold leading-tight text-slate-200">
                View products
              </span>
            </button>
          </div>
        </section>

        <div className="h-6" />
=======
            <p className="mt-4 text-sm text-slate-300">No specialist matches found for this skin type.</p>
          )}
        </section>

        <div className="flex flex-wrap gap-3 pb-4">
          <button
            type="button"
            onClick={() => navigate("/assessment")}
            className="rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-teal-400"
          >
            Start New Analysis
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border border-slate-600 bg-transparent px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Go Home
          </button>
        </div>
>>>>>>> 63ab1da28b61f318ccaaa975e1be3874046028bb
      </div>
    </div>
  );
};

export default Results;
