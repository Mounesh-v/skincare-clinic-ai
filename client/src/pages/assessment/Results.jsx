import React from "react";
import { useNavigate } from "react-router-dom";

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

const Results = ({ assessmentData }) => {
	const navigate = useNavigate();
	const lead = assessmentData?.lead || {};
	const analysis = assessmentData?.analysis || {};
	const image = assessmentData?.image;

	const skinType = String(analysis.skin_type || "Unknown");
	const confidence = formatPercent(analysis.confidence);
	const explanation = String(analysis.explanation || "No explanation available.");
	const scores = toScoreRows(analysis.scores);
	const recommendations = toRecommendations(analysis);

	return (
		<div className="min-h-screen bg-slate-50 px-4 py-8">
			<div className="mx-auto max-w-4xl space-y-6">
				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h1 className="text-2xl font-bold text-slate-900">Skin Analysis Results</h1>
					<p className="mt-2 text-slate-600">Personalized output from your uploaded image and questionnaire.</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">User Details</h2>
						<ul className="mt-4 space-y-2 text-sm text-slate-700">
							<li><span className="font-medium">Name:</span> {lead.name || "-"}</li>
							<li><span className="font-medium">Age:</span> {lead.age || "-"}</li>
							<li><span className="font-medium">Phone:</span> {lead.phone || "-"}</li>
							<li><span className="font-medium">Gender:</span> {lead.gender || "-"}</li>
						</ul>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">AI Classification</h2>
						<p className="mt-4 text-3xl font-bold text-slate-900">{skinType}</p>
						<p className="mt-1 text-sm text-slate-600">Confidence: {confidence}</p>
						<p className="mt-4 text-sm leading-relaxed text-slate-700">{explanation}</p>
					</div>
				</div>

				{image && (
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Uploaded Image</h2>
						<img src={image} alt="Uploaded skin" className="mt-4 w-full rounded-xl object-cover" />
					</div>
				)}

				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Score Breakdown</h2>
					<div className="mt-4 space-y-3">
						{scores.map((row) => (
							<div key={row.key}>
								<div className="mb-1 flex items-center justify-between text-sm text-slate-700">
									<span className="capitalize">{row.key}</span>
									<span>{formatPercent(row.value)}</span>
								</div>
								<div className="h-2 rounded-full bg-slate-200">
									<div className="h-2 rounded-full bg-emerald-500" style={{ width: formatPercent(row.value) }} />
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recommendations</h2>
					{recommendations.length > 0 ? (
						<ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
							{recommendations.map((item, idx) => (
								<li key={`${idx}-${String(item)}`}>{String(item)}</li>
							))}
						</ul>
					) : (
						<p className="mt-4 text-sm text-slate-600">No recommendations available from this response.</p>
					)}
				</div>

				<div className="flex flex-wrap gap-3">
					<button
						type="button"
						onClick={() => navigate("/assessment")}
						className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
					>
						Start New Analysis
					</button>
					<button
						type="button"
						onClick={() => navigate("/")}
						className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
					>
						Go Home
					</button>
				</div>
			</div>
		</div>
	);
};

export default Results;
