import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  RefreshCcw,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import Card, { CardBody } from "../../components/common/Card";
import { analyzeAssessment } from "../../services/api";

const STEPS = [
  { id: "about", label: "About You", subtitle: "Start with the basics" },
  {
    id: "skin",
    label: "Skin Health",
    subtitle: "Understand your skin's needs",
  },
  { id: "lifestyle", label: "Lifestyle", subtitle: "Habits that shape skin" },
  { id: "scan", label: "Skin Scan", subtitle: "Upload or capture a photo" },
  { id: "summary", label: "Summary", subtitle: "Review & finish" },
];

const INITIAL_LEAD = {
  name: "",
  age: "",
  phone: "",
  gender: "",
};

const INITIAL_ANSWERS = {
  main_concern: "",
  sensitivity: "",
  sleep: "",
  stress: "",
  water: "",
  diet: "",
};

const CONCERN_OPTIONS = [
  { value: "acne", label: "Acne & Breakouts" },
  { value: "pigmentation", label: "Dark Spots & Pigmentation" },
  { value: "wrinkles", label: "Fine Lines & Wrinkles" },
  { value: "dullness", label: "Dullness & Uneven Tone" },
  { value: "dark_circles", label: "Dark Circles & Puffiness" },
  { value: "rashes", label: "Rashes & Irritation" },
  { value: "none", label: "No specific concern" },
];

const SENSITIVITY_OPTIONS = [
  { value: "fragrance", label: "Fragrance" },
  { value: "sun", label: "Sun" },
  { value: "actives", label: "Actives (AHA/BHA/Retinol)" },
  { value: "none", label: "No major sensitivities" },
];

const LIFESTYLE_OPTIONS = {
  sleep: [
    { value: "less-5", label: "Less than 5 hrs" },
    { value: "5-6", label: "5-6 hrs" },
    { value: "7-8", label: "7-8 hrs" },
    { value: "more-8", label: "More than 8 hrs" },
  ],
  stress: [
    { value: "low", label: "Low" },
    { value: "moderate", label: "Moderate" },
    { value: "high", label: "High" },
    { value: "very-high", label: "Very High" },
  ],
  water: [
    { value: "less-2", label: "Less than 2 glasses" },
    { value: "2-4", label: "2-4 glasses" },
    { value: "5-8", label: "5-8 glasses" },
    { value: "more-8", label: "More than 8 glasses" },
  ],
  diet: [
    { value: "balanced", label: "Balanced & Whole Foods" },
    { value: "mostly-healthy", label: "Mostly Healthy" },
    { value: "average", label: "Average" },
    { value: "unhealthy", label: "Mostly Processed" },
  ],
};

const ANALYSIS_STAGES = [
  { label: "Detecting face", progress: 20 },
  { label: "Analyzing skin conditions", progress: 50 },
  { label: "Determining skin type", progress: 78 },
  { label: "Generating dermatologist-backed plan", progress: 96 },
];

const ASSESSMENT_STORAGE_KEY = "assessmentResultV2";
const SCORE_KEYS = ["oily", "dry", "normal", "combination"];

const clampToUnit = (value) => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(1, numeric));
};

const normalizeApiScores = (rawScores) => {
  const baseScores = { oily: 0, dry: 0, normal: 0, combination: 0 };
  if (!rawScores || typeof rawScores !== "object") {
    return baseScores;
  }

  for (const [key, value] of Object.entries(rawScores)) {
    const normalizedKey = String(key || "")
      .trim()
      .toLowerCase();
    if (SCORE_KEYS.includes(normalizedKey)) {
      baseScores[normalizedKey] = clampToUnit(value);
    }
  }

  return baseScores;
};

const normalizeAnalyzeResponse = (response) => {
  const source =
    response && typeof response === "object"
      ? response.analysis && typeof response.analysis === "object"
        ? response.analysis
        : response
      : {};

  const normalizedScores = normalizeApiScores(
    source.scores ?? source.skin_scores ?? source.type_scores,
  );

  return {
    ...source,
    skin_type:
      source.skin_type ??
      source.skinType ??
      source.type ??
      source.predicted_type ??
      source.predictedSkinType ??
      "Unknown",
    confidence: clampToUnit(source.confidence),
    scores: normalizedScores,
  };
};

const MAX_UPLOAD_DIMENSION = 1600;
const MAX_DECODED_UPLOAD_BYTES = 8 * 1024 * 1024;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });

const loadImageElement = (dataUrl) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error(
          "This image format is not supported. Please use JPG, PNG, WEBP, GIF, or BMP.",
        ),
      );
    image.src = dataUrl;
  });

const estimateDataUrlBytes = (dataUrl) => {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return 0;
  }
  const base64Length = dataUrl.length - commaIndex - 1;
  return Math.floor((base64Length * 3) / 4);
};

const normalizeImageForUpload = async (file) => {
  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImageElement(sourceDataUrl);

  const scale = Math.min(
    1,
    MAX_UPLOAD_DIMENSION / Math.max(image.width, image.height),
  );
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error(
      "Unable to process image in browser. Please try another image.",
    );
  }
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  let quality = 0.9;
  let outputDataUrl = canvas.toDataURL("image/jpeg", quality);
  while (
    estimateDataUrlBytes(outputDataUrl) > MAX_DECODED_UPLOAD_BYTES &&
    quality > 0.45
  ) {
    quality -= 0.1;
    outputDataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (estimateDataUrlBytes(outputDataUrl) > MAX_DECODED_UPLOAD_BYTES) {
    throw new Error(
      "Image is too large after compression. Please use a smaller or lower-resolution photo.",
    );
  }

  return outputDataUrl;
};

const StartAssessment = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [lead, setLead] = useState(INITIAL_LEAD);
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [imageData, setImageData] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysisStageIndex, setAnalysisStageIndex] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Shared metadata used by lifestyle-step UIs.
  const lifestyleFields = [
    { key: "sleep", title: "Sleep Routine", subtitle: "How many hours do you typically sleep per night?", icon: "😴", step: 1 },
    { key: "stress", title: "Stress Levels", subtitle: "How would you describe your daily stress?", icon: "🧘", step: 2 },
    { key: "water", title: "Water Intake", subtitle: "How much water do you drink daily?", icon: "💧", step: 3 },
    { key: "diet", title: "Diet Quality", subtitle: "How would you rate your eating habits?", icon: "🥗", step: 4 },
  ];

  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100);

  const stepIsValid = useMemo(() => {
    if (stepIndex === 0) {
      return lead.name.trim() && lead.age.trim() && lead.gender;
    }
    if (stepIndex === 1) {
      return answers.main_concern;
    }
    if (stepIndex === 2) {
      return answers.sleep && answers.stress && answers.water && answers.diet;
    }
    if (stepIndex === 3) {
      return Boolean(imageData);
    }
    return true;
  }, [stepIndex, lead, answers, imageData]);

  const handleLeadChange = (field, value) => {
    setLead((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(
        "Your browser does not support camera capture. Please upload a photo instead.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (error) {
      toast.error(
        "We could not access your camera. Please allow permissions or upload a photo.",
      );
    }
  };

  useEffect(() => {
    if (!cameraActive) {
      return;
    }
    const videoElement = videoRef.current;
    const stream = streamRef.current;
    if (videoElement && stream) {
      videoElement.srcObject = stream;
      videoElement.muted = true;
      const play = () => {
        videoElement.play().catch(() => undefined);
      };
      if (videoElement.readyState >= 2) {
        play();
      } else {
        videoElement.onloadedmetadata = play;
      }
    }
  }, [cameraActive]);

  const capturePhoto = () => {
    if (!videoRef.current) {
      return;
    }
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) {
      toast.error("Capture failed. Please try again or upload a photo.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setImageData(dataUrl);
    stopCamera();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      return;
    }

    try {
      const normalizedImageData = await normalizeImageForUpload(file);
      setImageData(normalizedImageData);
      stopCamera();
    } catch (error) {
      toast.error(
        error?.message ||
          "Could not process this image. Please try another one.",
      );
    }

    event.target.value = "";
  };

  useEffect(() => {
    if (stepIndex !== 3) {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  useEffect(() => {
    if (!submitting) {
      return undefined;
    }

    setAnalysisStageIndex(0);
    setAnalysisProgress(8);

    const interval = setInterval(() => {
      setAnalysisStageIndex((prev) =>
        Math.min(prev + 1, ANALYSIS_STAGES.length - 1),
      );
      setAnalysisProgress((prev) => Math.min(prev + 24, 96));
    }, 1400);

    return () => clearInterval(interval);
  }, [submitting]);

  const handleNext = () => {
    if (!stepIsValid) {
      toast.error("Please complete this section before continuing.");
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!stepIsValid) {
      toast.error("Please review the details before finishing.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        lead: {
          name: lead.name.trim(),
          phone: lead.phone.trim() || undefined,
          consent: true,
        },
        // Skin type determined by AI during analysis
        answers: {
          ...answers,
          age: lead.age.trim(),
          gender: lead.gender,
          phone: lead.phone.trim() || undefined,
        },
        image_data: imageData,
      };

      const data = await analyzeAssessment(payload);
      // DEBUG: Verify API response → state mapping (remove if confident in production)
      console.log("[SkinAnalysis] Raw API response:", data);
      const normalizedAnalysis = normalizeAnalyzeResponse(data);
      console.log("[SkinAnalysis] Normalized:", normalizedAnalysis);
      console.log(
        "[SkinAnalysis] skin_type =",
        normalizedAnalysis.skin_type,
        "| confidence =",
        normalizedAnalysis.confidence,
        "| scores =",
        normalizedAnalysis.scores,
      );
      const assessmentResult = {
        lead: payload.lead,
        answers: payload.answers,
        analysis: normalizedAnalysis,
        image: imageData,
      };

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("assessmentResult");
        window.localStorage.removeItem("assessmentData");
        window.localStorage.setItem(
          ASSESSMENT_STORAGE_KEY,
          JSON.stringify(assessmentResult),
        );
      }

      setAnalysisStageIndex(ANALYSIS_STAGES.length - 1);
      setAnalysisProgress(100);
      onComplete(assessmentResult);
    } catch (error) {
      const message =
        error?.message || "We could not generate the plan. Please try again.";
      toast.error(message);
      setSubmitting(false);
    }
  };

  // About You
  const renderAboutStep = () => {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 space-y-3 text-center sm:mb-10">
            <h2 className="bg-gradient-to-br from-slate-800 via-slate-700 to-[#4a6e1a] bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
              Tell us about yourself
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
              Personalized skincare starts here. All your data is encrypted and
              stored securely.
            </p>
          </div>

          {/* Card Wrapper */}
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-2xl shadow-[#97b94f]/10 backdrop-blur-sm sm:p-8">
            {/* Decorative top accent bar */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#7aaa2e] via-[#97b94f] to-[#b8d96a]" />

            {/* Decorative background orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#97b94f]/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#b8d96a]/8 blur-2xl" />

            <div className="relative space-y-6">
              {/* Section label */}
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Personal Info
                </span>
              </div>

              {/* Row 1: Name + Age */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Full Name */}
                <label className="group space-y-1.5">
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-[#6a8a2e]">
                    Full Name <span className="text-red-400">*</span>
                  </span>
                  <input
                    type="text"
                    value={lead.name}
                    onChange={(e) => handleLeadChange("name", e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/80 px-4 py-3 text-base font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-[#c5d98a] hover:bg-white focus:border-[#97b94f] focus:bg-white focus:ring-4 focus:ring-[#97b94f]/15"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    required
                  />
                </label>

                {/* Age */}
                <label className="group space-y-1.5">
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-[#6a8a2e]">
                    Age <span className="text-red-400">*</span>
                  </span>
                  <input
                    type="number"
                    min={13}
                    max={90}
                    value={lead.age}
                    onChange={(e) => handleLeadChange("age", e.target.value)}
                    placeholder="24"
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/80 px-4 py-3 text-base font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-[#c5d98a] hover:bg-white focus:border-[#97b94f] focus:bg-white focus:ring-4 focus:ring-[#97b94f]/15"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    required
                  />
                </label>
              </div>

              {/* Row 2: Phone */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="group space-y-1.5">
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-[#6a8a2e]">
                    Phone Number <span className="text-red-400">*</span>
                  </span>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <svg
                        className="h-4 w-4 text-slate-300 transition-colors group-focus-within:text-[#97b94f]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      value={lead.phone}
                      onChange={(e) =>
                        handleLeadChange("phone", e.target.value)
                      }
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-base font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-[#c5d98a] hover:bg-white focus:border-[#97b94f] focus:bg-white focus:ring-4 focus:ring-[#97b94f]/15"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      required
                    />
                  </div>
                </label>
              </div>

              {/* Divider with label */}
              <div className="relative flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Identity
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Gender <span className="text-red-400">*</span>
                </span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      value: "female",
                      label: "Female",
                      icon: "♀",
                      color: "from-rose-50 to-pink-50",
                      border: "border-rose-200",
                      ring: "ring-rose-200/50",
                      text: "text-rose-600",
                    },
                    {
                      value: "male",
                      label: "Male",
                      icon: "♂",
                      color: "from-sky-50 to-blue-50",
                      border: "border-sky-200",
                      ring: "ring-sky-200/50",
                      text: "text-sky-600",
                    },
                    {
                      value: "non-binary",
                      label: "Non-binary",
                      icon: "⚥",
                      color: "from-violet-50 to-purple-50",
                      border: "border-violet-200",
                      ring: "ring-violet-200/50",
                      text: "text-violet-600",
                    },
                    {
                      value: "prefer-not",
                      label: "Prefer not to say",
                      icon: "·",
                      color: "from-slate-50 to-gray-50",
                      border: "border-slate-300",
                      ring: "ring-slate-200/50",
                      text: "text-slate-500",
                    },
                  ].map((option) => {
                    const isSelected = lead.gender === option.value;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => handleLeadChange("gender", option.value)}
                        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                        className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-4 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 min-h-[64px] active:scale-[0.97] ${
                          isSelected
                            ? `bg-gradient-to-br ${option.color} ${option.border} ${option.text} shadow-md ring-2 ${option.ring}`
                            : "border-slate-200 bg-slate-50/80 text-slate-400 hover:border-slate-300 hover:bg-white hover:text-slate-600 hover:shadow-sm"
                        }`}
                      >
                        <span className="text-lg leading-none">
                          {option.icon}
                        </span>
                        <span className="leading-snug text-center">
                          {option.label}
                        </span>
                        {isSelected && (
                          <span className="absolute right-2 top-2">
                            <svg
                              className="h-3.5 w-3.5 text-[#97b94f]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#d4e9a8] bg-gradient-to-r from-[#f2f9e4] to-[#edf7d6] px-4 py-3.5 shadow-sm">
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
              <svg
                className="h-3.5 w-3.5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-700">
                Your privacy is protected.
              </span>{" "}
              Industry-standard encryption. We never share your data without
              explicit consent.{" "}
              <a
                href="#"
                className="font-medium text-[#6a8a2e] hover:underline"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  };

  //renderSkinStep
  const renderSkinStep = () => {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 space-y-3 text-center sm:mb-10">
            <h2 className="bg-gradient-to-br from-slate-800 via-slate-700 to-[#4a6e1a] bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
              Let&apos;s decode your skin
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
              Understanding your skin profile helps us recommend treatments
              perfectly suited to your needs.
            </p>
          </div>

          {/* Card Wrapper */}
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-2xl shadow-[#97b94f]/10 backdrop-blur-sm sm:p-8">
            {/* Top accent bar */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#7aaa2e] via-[#97b94f] to-[#b8d96a]" />

            {/* Decorative orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#97b94f]/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#b8d96a]/8 blur-2xl" />

            <div className="relative space-y-8">
              {/* ── Section 1: Skin Goals ── */}
              <div className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
                    <span className="text-xs font-bold text-white">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Optional Skin Goals
                    </p>
                    <p className="text-xs text-slate-400">
                      What would you like to improve?
                    </p>
                  </div>
                  <span className="ml-auto rounded-full border border-[#d4e9a8] bg-[#f2f9e4] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6a8a2e]">
                    Optional
                  </span>
                </div>

                {/* Concern Options - flex-wrap pills (no truncation) */}
                <div className="flex flex-wrap gap-2">
                  {CONCERN_OPTIONS.map((option) => {
                    const isSelected = answers.main_concern === option.value;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() =>
                          handleAnswerChange("main_concern", option.value)
                        }
                        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                        className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap min-h-[44px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#97b94f]/30 active:scale-[0.97] ${
                          isSelected
                            ? "border-[#97b94f] bg-gradient-to-br from-[#f0f7e0] to-[#e4f0cc] text-[#3d6010] shadow-md shadow-[#97b94f]/15 ring-2 ring-[#97b94f]/20"
                            : "border-slate-200 bg-slate-50/80 text-slate-600 hover:border-[#c5d98a] hover:bg-[#fafdf4] hover:text-slate-800"
                        }`}
                      >
                        {isSelected && (
                          <svg className="h-3.5 w-3.5 flex-shrink-0 text-[#97b94f]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Skin Reactivity
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              </div>

              {/* ── Section 2: Sensitivity ── */}
              <div className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
                    <span className="text-xs font-bold text-white">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Sensitivity Level
                    </p>
                    <p className="text-xs text-slate-400">
                      How reactive is your skin to products or environment?
                    </p>
                  </div>
                </div>

                {/* Sensitivity Options */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SENSITIVITY_OPTIONS.map((option) => {
                    const isSelected = answers.sensitivity === option.value;
                    const dotCount =
                      option.value === "none"
                        ? 1
                        : option.value === "fragrance"
                          ? 2
                          : option.value === "sun"
                            ? 3
                            : 4;

                    const dotColor =
                      option.value === "none"
                        ? "bg-emerald-400"
                        : option.value === "mild"
                          ? "bg-yellow-400"
                          : option.value === "moderate"
                            ? "bg-orange-400"
                            : "bg-red-400";

                    const selectedStyle =
                      option.value === "none"
                        ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700 ring-emerald-200/60"
                        : option.value === "mild"
                          ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 text-yellow-700 ring-yellow-200/60"
                          : option.value === "moderate"
                            ? "border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-700 ring-orange-200/60"
                            : "border-red-300 bg-gradient-to-br from-red-50 to-rose-50 text-red-700 ring-red-200/60";

                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() =>
                          handleAnswerChange("sensitivity", option.value)
                        }
                        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                        className={`group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 min-h-[80px] active:scale-[0.97] ${
                          isSelected
                            ? `${selectedStyle} shadow-md ring-2`
                            : "border-slate-200 bg-slate-50/80 text-slate-500 hover:border-slate-300 hover:bg-white hover:shadow-sm hover:text-slate-700"
                        }`}
                      >
                        {/* Dot meter */}
                        <div className="flex items-center gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                                i < dotCount
                                  ? isSelected
                                    ? dotColor
                                    : "bg-slate-300 group-hover:bg-slate-400"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span>{option.label}</span>
                        {isSelected && (
                          <span className="absolute right-2 top-2">
                            <svg
                              className="h-3.5 w-3.5 text-current opacity-70"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sensitivity color legend */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-2.5">
                  {[
                    { label: "None", color: "bg-emerald-400" },
                    { label: "Mild", color: "bg-yellow-400" },
                    { label: "Moderate", color: "bg-orange-400" },
                    { label: "High", color: "bg-red-400" },
                  ].map((item) => (
                    <span
                      key={item.label}
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400"
                    >
                      <span className={`h-2 w-2 rounded-full ${item.color}`} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tip Notice */}
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50/60 px-4 py-3.5 shadow-sm">
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-sm">
              <svg
                className="h-3.5 w-3.5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-700">Not sure?</span>{" "}
              Choose what feels most accurate — our specialists can refine this
              during your consultation.
            </p>
          </div>
        </div>
      </div>
    );
  };

  //renderLifestyleStep
  const renderLifestyleStep = () => {
    const lifestyleFields = [
      {
        key: "sleep",
        title: "Sleep Routine",
        subtitle: "How many hours do you typically sleep per night?",
        icon: "😴",
        step: 1,
        selectedBg: "linear-gradient(135deg, #eef2ff, #ede9fe)",
        selectedBorder: "#a5b4fc",
        selectedRing: "rgba(165,180,252,0.4)",
        selectedText: "#4338ca",
        badgeBg: "#eef2ff",
        badgeText: "#4338ca",
        badgeBorder: "#c7d2fe",
        iconBg: "linear-gradient(135deg, #818cf8, #6366f1)",
      },
      {
        key: "stress",
        title: "Stress Levels",
        subtitle: "How would you describe your daily stress?",
        icon: "🧘",
        step: 2,
        selectedBg: "linear-gradient(135deg, #fff1f2, #fce7f3)",
        selectedBorder: "#fda4af",
        selectedRing: "rgba(253,164,175,0.4)",
        selectedText: "#be123c",
        badgeBg: "#fff1f2",
        badgeText: "#be123c",
        badgeBorder: "#fecdd3",
        iconBg: "linear-gradient(135deg, #fb7185, #f43f5e)",
      },
      {
        key: "water",
        title: "Water Intake",
        subtitle: "How much water do you drink daily?",
        icon: "💧",
        step: 3,
        selectedBg: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
        selectedBorder: "#7dd3fc",
        selectedRing: "rgba(125,211,252,0.4)",
        selectedText: "#0369a1",
        badgeBg: "#f0f9ff",
        badgeText: "#0369a1",
        badgeBorder: "#bae6fd",
        iconBg: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
      },
      {
        key: "diet",
        title: "Diet Quality",
        subtitle: "How would you rate your eating habits?",
        icon: "🥗",
        step: 4,
        selectedBg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        selectedBorder: "#86efac",
        selectedRing: "rgba(134,239,172,0.4)",
        selectedText: "#15803d",
        badgeBg: "#f0fdf4",
        badgeText: "#15803d",
        badgeBorder: "#bbf7d0",
        iconBg: "linear-gradient(135deg, #4ade80, #22c55e)",
      },
    ];

    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-2xl">
          {/* ── Header ── */}
          <div className="mb-8 space-y-3 text-center sm:mb-10">
            <h2 className="bg-gradient-to-br from-slate-800 via-slate-700 to-[#4a6e1a] bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
              Your lifestyle, decoded
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
              Daily habits play a crucial role in skin health. Help us
              understand your routine for holistic recommendations.
            </p>
          </div>

          {/* ── Main Card ── */}
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-2xl shadow-[#97b94f]/10 backdrop-blur-sm sm:p-8">
            {/* Top accent bar */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#7aaa2e] via-[#97b94f] to-[#b8d96a]" />

            {/* Decorative orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#97b94f]/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#b8d96a]/5 blur-2xl" />

            <div className="relative space-y-1">
              {lifestyleFields.map((field, index) => (
                <div key={field.key}>
                  <div className="space-y-3 py-5">
                    {/* Section Header */}
                    <div className="flex items-center gap-3">
                      {/* Step number badge */}
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm"
                        style={{ background: field.iconBg }}
                      >
                        <span className="text-xs font-bold text-white">
                          {field.step}
                        </span>
                      </div>

                      {/* Title + subtitle */}
                      <div className="flex flex-1 items-center gap-2">
                        <span
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base shadow-sm"
                          style={{
                            background: field.badgeBg,
                            border: `1.5px solid ${field.badgeBorder}`,
                          }}
                        >
                          {field.icon}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {field.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {field.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Color dot accent */}
                      <span
                        className="hidden h-2.5 w-2.5 flex-shrink-0 rounded-full sm:block"
                        style={{ background: field.selectedBorder }}
                      />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {LIFESTYLE_OPTIONS[field.key].map((option) => {
                        const isSelected = answers[field.key] === option.value;
                        return (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() =>
                              handleAnswerChange(field.key, option.value)
                            }
                            style={
                              isSelected
                                ? {
                                    background: field.selectedBg,
                                    borderColor: field.selectedBorder,
                                    color: field.selectedText,
                                    boxShadow: `0 4px 14px ${field.selectedRing}`,
                                    outline: `2px solid ${field.selectedRing}`,
                                    outlineOffset: "1px",
                                    touchAction: 'manipulation',
                                    WebkitTapHighlightColor: 'transparent',
                                  }
                                : { touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }
                            }
                            className={`group relative overflow-hidden rounded-xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition-all duration-200 focus:outline-none min-h-[52px] active:scale-[0.97] ${
                              isSelected
                                ? "border-transparent"
                                : "border-slate-200 bg-slate-50/80 text-slate-600 hover:border-[#c5d98a] hover:bg-[#fafdf4] hover:text-slate-800 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold leading-snug">
                                  {option.label}
                                </p>
                                {option.description && (
                                  <p
                                    className={`mt-1 text-[10px] font-normal leading-relaxed ${
                                      isSelected
                                        ? "opacity-70"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {option.description}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <span className="mt-0.5 flex-shrink-0">
                                  <svg
                                    className="h-3.5 w-3.5 opacity-90"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider with next section's emoji */}
                  {index < lifestyleFields.length - 1 && (
                    <div className="relative flex items-center gap-3 py-0.5">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-sm shadow-sm"
                        style={{
                          background: lifestyleFields[index + 1].badgeBg,
                          border: `1.5px solid ${lifestyleFields[index + 1].badgeBorder}`,
                        }}
                      >
                        {lifestyleFields[index + 1].icon}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Holistic Tips Card ── */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#d4e9a8] bg-gradient-to-r from-[#f2f9e4] to-[#edf7d6] shadow-sm">
            <div className="flex items-start gap-3 px-4 py-4">
              <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
                <svg
                  className="h-3.5 w-3.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-700">
                  Holistic Skincare Approach
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Great skin isn't just about products — it's about balance.
                  We'll combine your lifestyle insights with targeted treatments
                  for optimal results.
                </p>
              </div>
            </div>

            {/* Quick Tips Strip — 4 tips matching each field color */}
            <div className="grid grid-cols-2 divide-x divide-[#d4e9a8] border-t border-[#d4e9a8] sm:grid-cols-4">
              {[
                {
                  icon: "💤",
                  label: "Sleep Tip",
                  tip: "7–9 hrs = cell regeneration",
                  color: "#eef2ff",
                  border: "#c7d2fe",
                },
                {
                  icon: "🧘",
                  label: "Stress Tip",
                  tip: "Calm mind = clear skin",
                  color: "#fff1f2",
                  border: "#fecdd3",
                },
                {
                  icon: "💧",
                  label: "Hydration Tip",
                  tip: "8 glasses keeps skin plump",
                  color: "#f0f9ff",
                  border: "#bae6fd",
                },
                {
                  icon: "🥗",
                  label: "Diet Tip",
                  tip: "Antioxidants fight aging",
                  color: "#f0fdf4",
                  border: "#bbf7d0",
                },
              ].map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-3 py-3"
                  style={{ background: tip.color }}
                >
                  <span className="mt-0.5 text-sm leading-none">
                    {tip.icon}
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-700">
                      {tip.label}
                    </p>
                    <p className="text-[10px] leading-snug text-slate-400">
                      {tip.tip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Privacy Reminder ── */}
          <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3 backdrop-blur-sm">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e]">
              <svg
                className="h-3 w-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-[11px] text-slate-400">
              Your lifestyle data is{" "}
              <span className="font-semibold text-slate-600">private</span> and
              used only to personalize your skincare journey.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderScanStep = () => {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-2xl">
          {/* ── Header ── */}
          <div className="mb-8 space-y-3 text-center sm:mb-10">
            <h2 className="bg-gradient-to-br from-slate-800 via-slate-700 to-[#4a6e1a] bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
              Capture your skin&apos;s story
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
              Our AI examines tone, texture, and unique characteristics to
              provide recommendations tailored to you.
            </p>
          </div>

          {/* ── Main Card ── */}
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-2xl shadow-[#97b94f]/10 backdrop-blur-sm">
            {/* Top accent bar */}
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#7aaa2e] via-[#97b94f] to-[#b8d96a]" />

            {/* Decorative orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#97b94f]/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#b8d96a]/5 blur-2xl" />

            <div className="relative grid gap-0 lg:grid-cols-2">
              {/* ── LEFT: Tips Panel ── */}
              <div className="space-y-5 border-b border-slate-100 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                {/* Panel label */}
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Pro Tips
                  </span>
                </div>

                {/* Tips List */}
                <ul className="space-y-3">
                  {[
                    {
                      icon: "☀️",
                      label: "Lighting",
                      text: "Use natural daylight near a window — avoid harsh overhead lights",
                      bg: "#fffbeb",
                      border: "#fde68a",
                    },
                    {
                      icon: "🧼",
                      label: "Clean Face",
                      text: "Remove makeup and cleanse for accurate texture analysis",
                      bg: "#f0fdf4",
                      border: "#bbf7d0",
                    },
                    {
                      icon: "📸",
                      label: "Stay Steady",
                      text: "Keep face centered and camera steady to avoid blur",
                      bg: "#eff6ff",
                      border: "#bfdbfe",
                    },
                    {
                      icon: "😐",
                      label: "Expression",
                      text: "Neutral expression works best — no squinting or smiling",
                      bg: "#fdf4ff",
                      border: "#e9d5ff",
                    },
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base shadow-sm"
                        style={{
                          background: tip.bg,
                          border: `1.5px solid ${tip.border}`,
                        }}
                      >
                        {tip.icon}
                      </span>
                      <div className="pt-0.5">
                        <p className="text-xs font-bold text-slate-700">
                          {tip.label}
                        </p>
                        <p className="text-xs leading-relaxed text-slate-400">
                          {tip.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                <div className="relative flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    AI
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                </div>

                {/* AI Feature Card */}
                <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50/60 px-4 py-3.5">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-sm">
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 7H7v6h6V7z" />
                      <path
                        fillRule="evenodd"
                        d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      AI-Powered Analysis
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      Analyzes skin tone, texture, pores, and concerns with
                      clinical-grade accuracy.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Upload / Camera Panel ── */}
              <div className="space-y-4 p-5 sm:p-7">
                {/* Panel label */}
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Your Photo
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* Upload */}
                  <label
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-[#97b94f] bg-[#f9fcf3] px-4 py-3 text-sm font-bold text-[#4f7a1a] shadow-sm transition-all duration-200 hover:border-[#7aaa2e] hover:bg-[#f0f7e0] hover:shadow-md active:scale-[0.97] min-h-[44px]"
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {/* Webcam */}
                  <Button
                    variant="secondary"
                    onClick={cameraActive ? stopCamera : startCamera}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                    className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold shadow-sm transition-all duration-200 min-h-[44px] active:scale-[0.97] ${
                      cameraActive
                        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                    }`}
                  >
                    <Camera className="h-4 w-4" />
                    {cameraActive ? "Stop Camera" : "Use Webcam"}
                  </Button>

                  {/* Reset */}
                  {imageData && (
                    <Button
                      variant="ghost"
                      onClick={() => setImageData(null)}
                      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md min-h-[44px] active:scale-[0.97]"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  )}
                </div>

                {/* Preview / Camera / Empty State */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-slate-50 to-white shadow-inner">
                  {cameraActive ? (
                    <div className="space-y-3 p-3">
                      <div className="relative overflow-hidden rounded-xl">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full rounded-xl bg-black"
                        />
                        {/* Face guide overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-52 w-40 rounded-full border-4 border-dashed border-white/50 shadow-inner" />
                        </div>
                        {/* Live badge */}
                        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                            Live
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        onClick={capturePhoto}
                        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                        className="w-full rounded-xl bg-gradient-to-r from-[#97b94f] to-[#7aaa2e] py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:from-[#88aa3f] hover:to-[#6a9a1e] min-h-[44px] active:scale-[0.98]"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Camera className="h-4 w-4" />
                          Capture Photo
                        </span>
                      </Button>
                    </div>
                  ) : imageData ? (
                    <div className="space-y-3 p-3">
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={imageData}
                          alt="Skin preview"
                          className="w-full rounded-xl object-cover"
                        />
                        {/* Success badge */}
                        <div className="absolute right-3 top-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg ring-2 ring-white">
                            <svg
                              className="h-4 w-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* Success bar */}
                      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2.5">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-emerald-800">
                          Photo ready for analysis
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Empty State */
                    <div className="flex h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #f0f5e3, #e4f0cc)",
                          border: "1.5px solid #c5d98a",
                        }}
                      >
                        <svg
                          className="h-8 w-8 text-[#7aaa2e]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          No photo yet
                        </p>
                        <p className="mt-1 max-w-[180px] text-xs leading-relaxed text-slate-400">
                          Upload or use your webcam to begin your skin analysis
                        </p>
                      </div>
                      {/* Dashed upload hint */}
                      <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-dashed border-[#97b94f]/40 bg-[#f9fcf3] px-3 py-1.5">
                        <Upload className="h-3.5 w-3.5 text-[#97b94f]" />
                        <span className="text-[10px] font-semibold text-[#6a8a2e]">
                          Tap Upload or Use Webcam above
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Privacy Notice */}
                <div className="flex items-start gap-2.5 rounded-2xl border border-[#e8f0d5] bg-[#f9fcf3] px-4 py-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    <span className="font-semibold text-slate-600">
                      Photo encrypted & secure.
                    </span>{" "}
                    We never share your images without explicit consent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // const renderSummaryStep = () => (
  //     <div className="min-h-screen w-full bg-gradient-to-br from-[#f4f9ec] via-[#eef5e0] to-[#e6f0d4] px-4 py-8 sm:py-12">
  //         <div className="mx-auto w-full max-w-3xl">

  //             {/* ── Header ── */}
  //             <div className="mb-8 space-y-3 text-center sm:mb-10">
  //                 <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c6da8a] bg-gradient-to-r from-[#e8f4c8] to-[#d6eca0] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#4f7a1a] shadow-sm">
  //                     <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7aaa2e]" />
  //                     Final Review
  //                 </span>
  //                 <h2 className="mt-3 bg-gradient-to-br from-slate-800 via-slate-700 to-[#4a6e1a] bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl lg:text-4xl">
  //                     All set! Let's build your regimen.
  //                 </h2>
  //                 <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
  //                     Review your details below. Go back anytime to make edits before we begin.
  //                 </p>
  //             </div>

  //             {/* ── Summary Cards ── */}
  //             <div className="space-y-4">

  //                 {/* ── Row 1: You + Skin Focus ── */}
  //                 <div className="grid gap-4 sm:grid-cols-2">

  //                     {/* You Card */}
  //                     <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-[#97b94f]/8 backdrop-blur-sm">
  //                         <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#7aaa2e] via-[#97b94f] to-[#b8d96a]" />

  //                         {/* Card Header */}
  //                         <div className="mb-4 flex items-center gap-2">
  //                             <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
  //                                 <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  //                                 </svg>
  //                             </div>
  //                             <span className="text-xs font-bold uppercase tracking-widest text-slate-400">About You</span>
  //                         </div>

  //                         {/* Fields */}
  //                         <ul className="space-y-2.5">
  //                             {[
  //                                 { label: 'Name',   value: lead.name,   icon: '👤' },
  //                                 { label: 'Age',    value: lead.age,    icon: '🎂' },
  //                                 { label: 'Phone',  value: lead.phone,  icon: '📱' },
  //                                 { label: 'Gender', value: lead.gender, icon: '⚧' },
  //                             ].map((item) => (
  //                                 <li key={item.label} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
  //                                     <span className="text-sm leading-none">{item.icon}</span>
  //                                     <span className="text-xs font-semibold text-slate-400">{item.label}</span>
  //                                     <span className="ml-auto text-xs font-bold text-slate-700">
  //                                         {item.value || <span className="font-normal italic text-slate-300">Not provided</span>}
  //                                     </span>
  //                                 </li>
  //                             ))}
  //                         </ul>
  //                     </div>

  //                     {/* Skin Focus Card */}
  //                     <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-[#97b94f]/8 backdrop-blur-sm">
  //                         <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#7aaa2e] via-[#97b94f] to-[#b8d96a]" />

  //                         {/* Card Header */}
  //                         <div className="mb-4 flex items-center gap-2">
  //                             <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
  //                                 <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
  //                                 </svg>
  //                             </div>
  //                             <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Skin Focus</span>
  //                         </div>

  //                         {/* Concern */}
  //                         <div className="space-y-2.5">
  //                             <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
  //                                 <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Primary Concern</p>
  //                                 <p className="mt-1 text-sm font-bold text-slate-700">
  //                                     {answers.main_concern || <span className="font-normal italic text-slate-300">Not provided</span>}
  //                                 </p>
  //                             </div>

  //                             {/* Sensitivity with color dot */}
  //                             <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
  //                                 <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Sensitivity</p>
  //                                 <div className="mt-1 flex items-center gap-2">
  //                                     {answers.sensitivity && (
  //                                         <span
  //                                             className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
  //                                             style={{
  //                                                 background:
  //                                                     answers.sensitivity === 'none'     ? '#34d399' :
  //                                                     answers.sensitivity === 'mild'     ? '#fbbf24' :
  //                                                     answers.sensitivity === 'moderate' ? '#fb923c' :
  //                                                                                          '#f87171',
  //                                             }}
  //                                         />
  //                                     )}
  //                                     <p className="text-sm font-bold text-slate-700">
  //                                         {answers.sensitivity || <span className="font-normal italic text-slate-300">Not provided</span>}
  //                                     </p>
  //                                 </div>
  //                             </div>
  //                         </div>
  //                     </div>
  //                 </div>

  //                 {/* ── Lifestyle Snapshot Card ── */}
  //                 <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-[#97b94f]/8 backdrop-blur-sm sm:p-6">
  //                     <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#7aaa2e] via-[#97b94f] to-[#b8d96a]" />

  //                     {/* Card Header */}
  //                     <div className="mb-4 flex items-center gap-2">
  //                         <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
  //                             <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
  //                                 <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  //                             </svg>
  //                         </div>
  //                         <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Lifestyle Snapshot</span>
  //                     </div>

  //                     <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
  //                         {[
  //                             { label: 'Sleep',  value: answers.sleep,  icon: '😴', bg: '#eef2ff', border: '#c7d2fe', dot: '#818cf8' },
  //                             { label: 'Stress', value: answers.stress, icon: '🧘', bg: '#fff1f2', border: '#fecdd3', dot: '#fb7185' },
  //                             { label: 'Water',  value: answers.water,  icon: '💧', bg: '#f0f9ff', border: '#bae6fd', dot: '#38bdf8' },
  //                             { label: 'Diet',   value: answers.diet,   icon: '🥗', bg: '#f0fdf4', border: '#bbf7d0', dot: '#4ade80' },
  //                         ].map((item) => (
  //                             <div
  //                                 key={item.label}
  //                                 className="flex flex-col gap-2 rounded-xl p-3"
  //                                 style={{ background: item.bg, border: `1.5px solid ${item.border}` }}
  //                             >
  //                                 <div className="flex items-center gap-1.5">
  //                                     <span className="text-base leading-none">{item.icon}</span>
  //                                     <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{item.label}</span>
  //                                 </div>
  //                                 <p className="text-xs font-bold leading-snug text-slate-700">
  //                                     {item.value || <span className="font-normal italic text-slate-300">—</span>}
  //                                 </p>
  //                             </div>
  //                         ))}
  //                     </div>
  //                 </div>

  //                 {/* ── Skin Scan Card ── */}
  //                 <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-[#97b94f]/8 backdrop-blur-sm sm:p-6">
  //                     <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#7aaa2e] via-[#97b94f] to-[#b8d96a]" />

  //                     {/* Card Header */}
  //                     <div className="mb-4 flex items-center gap-2">
  //                         <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
  //                             <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
  //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  //                             </svg>
  //                         </div>
  //                         <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Skin Scan</span>
  //                         {imageData && (
  //                             <span className="ml-auto flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
  //                                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
  //                                 Ready
  //                             </span>
  //                         )}
  //                     </div>

  //                     {imageData ? (
  //                         <div className="space-y-3">
  //                             <div className="relative overflow-hidden rounded-xl">
  //                                 <img
  //                                     src={imageData}
  //                                     alt="Skin scan preview"
  //                                     className="max-h-64 w-full rounded-xl object-cover shadow-inner"
  //                                 />
  //                                 {/* Corner badge */}
  //                                 <div className="absolute right-3 top-3">
  //                                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg ring-2 ring-white">
  //                                         <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
  //                                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  //                                         </svg>
  //                                     </div>
  //                                 </div>
  //                             </div>
  //                             <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2.5">
  //                                 <svg className="h-4 w-4 flex-shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
  //                                     <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  //                                 </svg>
  //                                 <p className="text-xs font-medium text-emerald-800">
  //                                     This photo will be used to tailor your personalized skincare regimen.
  //                                 </p>
  //                             </div>
  //                         </div>
  //                     ) : (
  //                         <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-8 text-center">
  //                             <div
  //                                 className="flex h-12 w-12 items-center justify-center rounded-2xl"
  //                                 style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', border: '1.5px solid #cbd5e1' }}
  //                             >
  //                                 <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
  //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  //                                 </svg>
  //                             </div>
  //                             <div>
  //                                 <p className="text-sm font-bold text-slate-500">No image provided</p>
  //                                 <p className="mt-0.5 text-xs text-slate-400">Go back to the scan step to add a photo</p>
  //                             </div>
  //                         </div>
  //                     )}
  //                 </div>

  //             </div>

  //             {/* ── Ready Banner ── */}
  //             <div className="mt-5 overflow-hidden rounded-2xl border border-[#d4e9a8] bg-gradient-to-r from-[#f2f9e4] to-[#edf7d6] shadow-sm">
  //                 <div className="flex items-start gap-3 px-5 py-4">
  //                     <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e] shadow-sm">
  //                         <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
  //                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  //                         </svg>
  //                     </div>
  //                     <div className="flex-1">
  //                         <p className="text-sm font-bold text-slate-700">You're all set!</p>
  //                         <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
  //                             Our specialists will review your profile and prepare a personalized skincare regimen tailored just for you.
  //                         </p>
  //                     </div>
  //                 </div>

  //                 {/* Completion checklist strip */}
  //                 <div className="grid grid-cols-2 divide-x divide-[#d4e9a8] border-t border-[#d4e9a8] sm:grid-cols-4">
  //                     {[
  //                         { label: 'Profile',   done: !!(lead.name && lead.age),              icon: '👤' },
  //                         { label: 'Skin Data', done: !!(answers.main_concern || answers.sensitivity), icon: '🔬' },
  //                         { label: 'Lifestyle', done: !!(answers.sleep && answers.diet),       icon: '🌿' },
  //                         { label: 'Scan',      done: !!imageData,                             icon: '📸' },
  //                     ].map((item) => (
  //                         <div
  //                             key={item.label}
  //                             className="flex items-center gap-2 px-3 py-2.5"
  //                             style={{ background: item.done ? '#f0fdf4' : '#fafafa' }}
  //                         >
  //                             <span className="text-sm leading-none">{item.icon}</span>
  //                             <div>
  //                                 <p className="text-[10px] font-bold text-slate-600">{item.label}</p>
  //                                 <p
  //                                     className="text-[10px] font-semibold"
  //                                     style={{ color: item.done ? '#16a34a' : '#94a3b8' }}
  //                                 >
  //                                     {item.done ? '✓ Complete' : 'Skipped'}
  //                                 </p>
  //                             </div>
  //                         </div>
  //                     ))}
  //                 </div>
  //             </div>

  //             {/* ── Privacy Reminder ── */}
  //             <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3 backdrop-blur-sm">
  //                 <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7aaa2e]">
  //                     <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
  //                         <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  //                     </svg>
  //                 </div>
  //                 <p className="text-[11px] text-slate-400">
  //                     All data is <span className="font-semibold text-slate-600">encrypted</span> and used solely to build your skincare regimen.
  //                 </p>
  //             </div>

  //         </div>
  //     </div>
  // );

  <div className="w-full space-y-8 sm:space-y-12 px-2 sm:px-4 py-4 sm:py-8">
    {/* Header Section */}
    <div className="space-y-3 sm:space-y-4 text-center -mx-15">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
        Your lifestyle, decoded
      </h2>
      <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-600">
        Your daily habits play a crucial role in skin health. Help us understand
        your routine so we can recommend holistic solutions.
      </p>
    </div>

    {/* Lifestyle Questions */}
    <div className="space-y-8">
      {lifestyleFields.map((field) => (
        <div key={field.key} className="space-y-4">
          {/* Section Header */}
          <div className="flex items-start gap-3 -mx-15">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7a9a3f] text-sm font-bold text-white shadow-md">
              {field.step}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{field.icon}</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {field.title}
                </h3>
              </div>
              <p className="mt-1 text-sm text-slate-600">{field.subtitle}</p>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 -mx-15">
            {LIFESTYLE_OPTIONS[field.key].map((option) => (
              <button
                key={option.value}
                className="p-4 border rounded-xl text-left hover:shadow-md transition"
              >
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>

                {/* Optional description */}
                {option.description && (
                  <p className="mt-2 text-xs text-slate-600">
                    {option.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>;

  {
    /* Privacy Reminder */
  }
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 -mx-15">
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <svg
        className="h-4 w-4 text-slate-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <span>
        Your lifestyle data is private and used only to personalize your
        skincare journey.
      </span>
    </div>
  </div>;

  //     const renderScanStep = () => {
  //       return(
  //       <div className="-mx-15 sm:mx-auto max-w-5xl space-y-8 sm:space-y-12 px-2 sm:px-4 py-4 sm:py-8">
  //         {/* Header Section */}
  //         <div className="space-y-3 sm:space-y-4 text-center">
  //           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
  //             Capture your skin's story
  //           </h2>
  //           <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-600">
  //             Our AI-powered analysis will examine your skin's tone, texture, and
  //             unique characteristics to provide personalized recommendations.
  //           </p>
  //         </div>

  //         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  //           {/* Tips Card - Left Side */}
  //           <div className="space-y-6">
  //             {/* Main Tips Card */}
  //             <div className="rounded-2xl border-2 border-[#97b94f]/30 bg-gradient-to-br from-[#f0f5e3] to-white p-6 shadow-lg">
  //               <div className="mb-4 flex items-center gap-3">
  //                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#97b94f]">
  //                   <svg
  //                     className="h-5 w-5 text-white"
  //                     fill="currentColor"
  //                     viewBox="0 0 20 20"
  //                   >
  //                     <path
  //                       fillRule="evenodd"
  //                       d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
  //                       clipRule="evenodd"
  //                     />
  //                   </svg>
  //                 <>
  //   <h3 className="text-lg font-bold text-slate-900">
  //     Pro Tips for Best Results
  //   </h3>
  // </>
  //               </div>

  //               <ul className="space-y-3">
  //                 {[
  //                   {
  //                     icon: "☀️",
  //                     text: "Use natural daylight near a window—avoid harsh overhead lights",
  //                   },
  //                   {
  //                     icon: "🧼",
  //                     text: "Remove makeup and cleanse your face for accurate texture analysis",
  //                   },
  //                   {
  //                     icon: "📸",
  //                     text: "Keep your face centered and camera steady to avoid blur",
  //                   },
  //                   {
  //                     icon: "😊",
  //                     text: "Neutral expression works best—no squinting or smiling",
  //                   },
  //                 ].map((tip, index) => (
  //                   <li key={index} className="flex items-start gap-3">
  //                     <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
  //                       {tip.icon}
  //                     </span>
  //                     <span className="pt-1 text-sm leading-relaxed text-slate-700">
  //                       {tip.text}
  //                     </span>
  //                   </li>
  //                 ))}
  //               </ul>
  //             </div>

  //             {/* AI Feature Highlight */}
  //             <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
  //               <div className="flex items-start gap-3">
  //                 <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
  //                   <svg
  //                     className="h-4 w-4"
  //                     fill="currentColor"
  //                     viewBox="0 0 20 20"
  //                   >
  //                     <path d="M13 7H7v6h6V7z" />
  //                     <path
  //                       fillRule="evenodd"
  //                       d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
  //                       clipRule="evenodd"
  //                     />
  //                   </svg>
  //                 </div>
  //                 <div>
  //                   <h4 className="text-sm font-bold text-slate-900">
  //                     AI-Powered Analysis
  //                   </h4>
  //                   <p className="mt-1 text-xs leading-relaxed text-slate-600">
  //                     Our advanced technology analyzes skin tone, texture, pores,
  //                     and potential concerns with clinical-grade accuracy.
  //                   </p>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Upload/Camera Section - Right Side */}
  //           <div className="space-y-5">
  //             {/* Action Buttons */}
  //             <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pb-2">
  //               <label className="group relative flex w-full sm:w-auto cursor-pointer justify-center items-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-[#97b94f] bg-white px-6 py-3.5 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-[#7ea531] hover:bg-[#f0f5e3] hover:shadow-md">
  //                 <Upload className="h-5 w-5 text-[#97b94f]" />
  //                 <span className="text-sm">Upload Photo</span>
  //                 <input
  //                   type="file"
  //                   accept="image/*"
  //                   className="hidden"
  //                   onChange={handleFileUpload}
  //                 />
  //               </label>

  //               <Button
  //                 variant="secondary"
  //                 onClick={cameraActive ? stopCamera : startCamera}
  //                 className={`flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl border-2 px-6 py-3.5 text-sm font-semibold shadow-sm transition-all duration-200 ${
  //                   cameraActive
  //                     ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
  //                     : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md"
  //                 }`}
  //               >
  //                 <Camera className="h-5 w-5" />
  //                 {cameraActive ? "Stop Camera" : "Use Webcam"}
  //               </Button>

  //               {imageData && (
  //                 <Button
  //                   variant="ghost"
  //                   onClick={() => setImageData(null)}
  //                   className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
  //                 >
  //                   <RefreshCcw className="h-5 w-5" />
  //                   Reset
  //                 </Button>
  //               )}
  //             </div>

  //             {/* Preview/Camera Area */}
  //             <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-lg">
  //               {cameraActive ? (
  //                 <div className="space-y-4 p-4">
  //                   <div className="relative overflow-hidden rounded-xl">
  //                     <video
  //                       ref={videoRef}
  //                       autoPlay
  //                       playsInline
  //                       muted
  //                       className="w-full rounded-xl bg-black shadow-inner"
  //                     />
  //                     {/* Camera overlay guide */}
  //                     <div className="absolute inset-0 flex items-center justify-center">
  //                       <div className="h-64 w-64 rounded-full border-4 border-dashed border-white/40"></div>
  //                     </div>
  //                   </div>
  //                   <Button
  //                     variant="primary"
  //                     onClick={capturePhoto}
  //                     className="w-full rounded-xl bg-gradient-to-r from-[#97b94f] to-[#7ea531] py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-200 hover:shadow-xl"
  //                   >
  //                     <span className="flex items-center justify-center gap-2">
  //                       <Camera className="h-5 w-5" />
  //                       Capture Photo
  //                     </span>
  //                   </Button>
  //                 </div>
  //               ) : imageData ? (
  //                 <div className="space-y-3 p-4">
  //                   <div className="relative overflow-hidden rounded-xl">
  //                     <img
  //                       src={imageData}
  //                       alt="Skin preview"
  //                     />
  //                     {/* Success checkmark overlay */}
  //                     <div className="absolute right-3 top-3">
  //                       <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-lg">
  //                         <svg
  //                           className="h-6 w-6 text-white"
  //                           fill="currentColor"
  //                           viewBox="0 0 20 20"
  //                         >
  //                           <path
  //                             fillRule="evenodd"
  //                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
  //                             clipRule="evenodd"
  //                           />
  //                         </svg>
  //                       </div>
  //                     </div>
  //                   </div>
  //                   <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
  //                     <svg
  //                       className="h-5 w-5 text-green-600"
  //                       fill="currentColor"
  //                       viewBox="0 0 20 20"
  //                     >
  //                       <path
  //                         fillRule="evenodd"
  //                         d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
  //                         clipRule="evenodd"
  //                       />
  //                     </svg>
  //                     <span className="text-sm font-semibold text-green-900">
  //                       Photo uploaded successfully
  //                     </span>
  //                   </div>
  //                 </div>
  //               ) : (
  //                 <div className="flex h-80 flex-col items-center justify-center p-8 text-center">
  //                   <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
  //                     <svg
  //                       className="h-10 w-10 text-slate-400"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       viewBox="0 0 24 24"
  //                     >
  //                       <path
  //                         strokeLinecap="round"
  //                         strokeLinejoin="round"
  //                         strokeWidth={2}
  //                         d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
  //                       />
  //                       <path
  //                         strokeLinecap="round"
  //                         strokeLinejoin="round"
  //                         strokeWidth={2}
  //                         d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
  //                       />
  //                     </svg>
  //                   </div>
  //                   <h4 className="text-lg font-bold text-slate-900">
  //                     No photo yet
  //                   </h4>
  //                   <p className="mt-2 max-w-xs text-sm text-slate-600">
  //                     Upload a clear photo or use your webcam to begin your
  //                     personalized skin analysis
  //                   </p>
  //                 </div>
  //               )}
  //             </div>

  //             {/* Privacy Notice */}
  //             <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
  //               <div className="flex items-start gap-2">
  //                 <svg
  //                   className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500"
  //                   fill="currentColor"
  //                   viewBox="0 0 20 20"
  //                 >
  //                   <path
  //                     fillRule="evenodd"
  //                     d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
  //                     clipRule="evenodd"
  //                   />
  //                 </svg>
  //                 <p className="text-xs leading-relaxed text-slate-600">
  //                   Your photo is encrypted and analyzed securely. We never share
  //                   your images without consent.
  //                 </p>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //       </div>
  //     );};

  const renderSummaryStep = () => {
    return (
      <div className="space-y-8 sm:space-y-10 px-2 sm:px-4 py-4 sm:py-8 -mx-15">
        <div className="space-y-2 sm:space-y-3 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-800">
            All set! Let&apos;s build your personalised regimen.
          </h2>
          <p className="text-sm text-slate-600">
            Review the details below. You can go back if you need to make edits.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <Card className="border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              You
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>
                <span className="font-medium">Name:</span> {lead.name || "—"}
              </li>
              <li>
                <span className="font-medium">Age:</span> {lead.age || "—"}
              </li>
              <li>
                <span className="font-medium">Phone:</span> {lead.phone || "—"}
              </li>
              <li>
                <span className="font-medium">Gender:</span>{" "}
                {lead.gender || "—"}
              </li>
            </ul>
          </Card>

          <Card className="border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Skin Focus
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>
                <span className="font-medium">Primary Concern:</span>{" "}
                {answers.main_concern || "—"}
              </li>
              <li>
                <span className="font-medium">Sensitivity:</span>{" "}
                {answers.sensitivity || "—"}
              </li>
            </ul>
          </Card>

          <Card className="border border-slate-200 bg-white p-4 sm:p-6 shadow-sm md:col-span-2 ">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Lifestyle Snapshot
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-[#f9fafb] p-4 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Sleep:</span>{" "}
                {answers.sleep || "—"}
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#f9fafb] p-4 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Stress:</span>{" "}
                {answers.stress || "—"}
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#f9fafb] p-4 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Water:</span>{" "}
                {answers.water || "—"}
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#f9fafb] p-4 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Diet:</span>{" "}
                {answers.diet || "—"}
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200 bg-white p-4 sm:p-6 shadow-sm md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Skin Scan
            </h3>
            {imageData ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-[#f9fafb] p-4">
                <img
                  src={imageData}
                  alt="Skin scan preview"
                  className="w-full rounded-2xl object-cover"
                />
                <p className="mt-3 text-sm text-slate-600">
                  We will use this photo to tailor your regimen.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No image provided.</p>
            )}
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f6f4]">
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-gradient-to-br from-white via-teal-50 to-emerald-100 py-1 shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo and Brand Name */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Logo Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md transition-shadow hover:shadow-lg sm:h-12 sm:w-12">
                <span className="text-xl sm:text-2xl">🌿</span>
              </div>

              {/* Brand Name */}
              <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-base font-bold text-transparent sm:text-xl lg:text-2xl">
                SkinCare AI
              </h1>
            </div>

            {/* Exit Button */}
            <a
              href="/"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              className="group flex items-center gap-2 rounded-lg border-2 border-emerald-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-md min-h-[44px] active:scale-[0.97] sm:px-4"
            >
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="hidden sm:inline">Exit</span>
            </a>
          </div>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-4xl px-0 sm:px-6 py-0 sm:py-12">
        <div className="rounded-none sm:rounded-3xl border-0 sm:border border-[#e5e7eb] bg-white sm:shadow-sm overflow-hidden min-h-screen sm:min-h-[auto]">
          <div className="border-b border-[#e5e7eb] bg-[#f7f8f9] px-5 sm:px-8 py-4 sm:py-5">
            {/* Mobile: current step pill + counter */}
            <div className="flex items-center justify-between md:hidden">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#97b94f] text-sm font-bold text-white shadow-sm">
                  {stepIndex + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{STEPS[stepIndex].label}</p>
                  <p className="text-[11px] text-slate-400 leading-tight">{STEPS[stepIndex].subtitle}</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {stepIndex + 1} / {STEPS.length}
              </span>
            </div>

            {/* Desktop: full horizontal steps with connecting lines */}
            <div className="hidden md:flex items-center justify-center">
              {STEPS.map((step, index) => {
                const isActive = index === stepIndex;
                const isCompleted = index < stepIndex;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-[#97b94f] text-white shadow-sm"
                          : isActive
                            ? "bg-[#97b94f] text-white shadow-md ring-4 ring-[#97b94f]/20"
                            : "bg-[#e5e7eb] text-slate-400"
                      }`}>
                        {isCompleted ? (
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold whitespace-nowrap transition-colors duration-300 ${
                        isActive ? "text-[#5a7a1a]" : isCompleted ? "text-slate-500" : "text-slate-400"
                      }`}>{step.label}</span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className="mx-1 mt-[-14px] h-px flex-1 transition-all duration-500"
                        style={{ background: index < stepIndex ? '#97b94f' : '#e5e7eb' }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#e2e6eb]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7aaa2e] to-[#97b94f] transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="px-5 sm:px-10 md:px-10 py-6 sm:py-8 md:py-10">
            <Card className="border-0 shadow-none">
              <CardBody className="p-0">
                {stepIndex === 0 && renderAboutStep()}
                {stepIndex === 1 && renderSkinStep()}
                {stepIndex === 2 && renderLifestyleStep()}
                {stepIndex === 3 && renderScanStep()}
                {stepIndex === 4 && renderSummaryStep()}
              </CardBody>
            </Card>
          </div>

          <div
            className="flex flex-col gap-4 border-t border-[#e5e7eb] bg-[#f7f8f9] px-4 sm:px-8 py-4 sm:py-6 md:flex-row md:items-center md:justify-between"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <div className="text-sm text-slate-500 text-center md:text-left">
              Step {stepIndex + 1} of {STEPS.length} ·{" "}
              {STEPS[stepIndex].subtitle}
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={stepIndex === 0 || submitting}
                icon={ArrowLeft}
                iconPosition="left"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                className="w-full sm:w-auto justify-center text-slate-600 hover:bg-[#e5e7eb] min-h-[44px] active:scale-[0.97]"
              >
                Back
              </Button>
              {stepIndex < STEPS.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!stepIsValid || submitting}
                  icon={ArrowRight}
                  iconPosition="right"
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  className="w-full sm:w-auto justify-center bg-[#5d5f63] uppercase tracking-wide hover:bg-[#4d4f52] min-h-[44px] active:scale-[0.97]"
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                  icon={ArrowRight}
                  iconPosition="right"
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  className="w-full sm:w-auto justify-center bg-[#5d5f63] uppercase tracking-wide hover:bg-[#4d4f52] min-h-[44px] active:scale-[0.97]"
                >
                  Get Analysis & Match Doctors
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-[#97b94f]" />
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#97b94f]/30 border-t-[#97b94f]" />
              <p className="text-base font-semibold text-slate-800">
                {ANALYSIS_STAGES[analysisStageIndex]?.label}
              </p>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8eb241] via-[#6b8f34] to-[#4a6d27] transition-all duration-700 ease-out"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Processing image</span>
              <span>{analysisProgress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartAssessment;
