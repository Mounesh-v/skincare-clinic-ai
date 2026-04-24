import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import { getTopDoctors } from "../../data/doctors";

const SCORE_KEYS = ["oily", "dry", "normal", "combination"];

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

const Results = ({ assessmentData }) => {
  const navigate = useNavigate();
  const lead = assessmentData?.lead || {};
  const answers = assessmentData?.answers || {};
  const analysis = assessmentData?.analysis || {};
  const response = analysis;
  const image = assessmentData?.image;

  const predictedTypeRaw = String(response.skin_type || "Unknown");
  const predictedType = predictedTypeRaw.replace(/^./, (c) => c.toUpperCase());
  const skinType = predictedType;
  const skinTypeKey = predictedType.toLowerCase().trim();
  const confidence = formatPercent(response.confidence);
  const confidenceLevel = String(response.confidence_level || "");
  const explanation = String(response.enriched_explanation || response.explanation || "No explanation available.");
  const scores = toScoreRows(response.scores);
  const recommendations = toRecommendations(response);
  const top2Gap = Number(response.top2_gap);

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
  }, [response.skin_type, predictedType]);

  useEffect(() => {
    let mounted = true;

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
    return () => {
      mounted = false;
    };
  }, [skinTypeKey]);

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
            </button>
          </div>

          {productsLoading ? (
            <p className="mt-4 text-sm text-slate-300">Loading product matches...</p>
          ) : products.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const id = product._id || product.id;
                const name = product.name || "Product";
                const price = product.price;
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
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
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
                  >
                    Consult
                  </button>
                </article>
              ))}
            </div>
          ) : (
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
      </div>
    </div>
  );
};

export default Results;
