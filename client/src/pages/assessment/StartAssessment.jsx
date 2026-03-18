import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, RefreshCcw, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/common/Button';
import Card, { CardBody } from '../../components/common/Card';
import { analyzeAssessment } from '../../services/api';

const STEPS = [
    { id: 'about', label: 'About You', subtitle: 'Start with the basics' },
    { id: 'skin', label: 'Skin Health', subtitle: "Understand your skin's needs" },
    { id: 'lifestyle', label: 'Lifestyle', subtitle: 'Habits that shape skin' },
    { id: 'scan', label: 'Skin Scan', subtitle: 'Upload or capture a photo' },
    { id: 'summary', label: 'Summary', subtitle: 'Review & finish' },
];

const INITIAL_LEAD = {
    name: '',
    age: '',
    phone: '',
    gender: '',
};

const INITIAL_ANSWERS = {
    main_concern: '',
    sensitivity: '',
    sleep: '',
    stress: '',
    water: '',
    diet: '',
};

const CONCERN_OPTIONS = [
    { value: 'acne', label: 'Acne & Breakouts' },
    { value: 'pigmentation', label: 'Dark Spots & Pigmentation' },
    { value: 'wrinkles', label: 'Fine Lines & Wrinkles' },
    { value: 'dullness', label: 'Dullness & Uneven Tone' },
    { value: 'dark_circles', label: 'Dark Circles & Puffiness' },
    { value: 'rashes', label: 'Rashes & Irritation' },
    { value: 'none', label: 'No specific concern' },
];

const SENSITIVITY_OPTIONS = [
    { value: 'fragrance', label: 'Fragrance' },
    { value: 'sun', label: 'Sun' },
    { value: 'actives', label: 'Actives (AHA/BHA/Retinol)' },
    { value: 'none', label: 'No major sensitivities' },
];

const LIFESTYLE_OPTIONS = {
    sleep: [
        { value: 'less-5', label: 'Less than 5 hrs' },
        { value: '5-6', label: '5-6 hrs' },
        { value: '7-8', label: '7-8 hrs' },
        { value: 'more-8', label: 'More than 8 hrs' },
    ],
    stress: [
        { value: 'low', label: 'Low' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'high', label: 'High' },
        { value: 'very-high', label: 'Very High' },
    ],
    water: [
        { value: 'less-2', label: 'Less than 2 glasses' },
        { value: '2-4', label: '2-4 glasses' },
        { value: '5-8', label: '5-8 glasses' },
        { value: 'more-8', label: 'More than 8 glasses' },
    ],
    diet: [
        { value: 'balanced', label: 'Balanced & Whole Foods' },
        { value: 'mostly-healthy', label: 'Mostly Healthy' },
        { value: 'average', label: 'Average' },
        { value: 'unhealthy', label: 'Mostly Processed' },
    ],
};

const ANALYSIS_STAGES = [
    { label: 'Detecting face', progress: 20 },
    { label: 'Analyzing skin conditions', progress: 50 },
    { label: 'Determining skin type', progress: 78 },
    { label: 'Generating dermatologist-backed plan', progress: 96 },
];

const MAX_UPLOAD_DIMENSION = 1600;
const MAX_DECODED_UPLOAD_BYTES = 8 * 1024 * 1024;

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read selected image.'));
    reader.readAsDataURL(file);
});

const loadImageElement = (dataUrl) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This image format is not supported. Please use JPG, PNG, WEBP, GIF, or BMP.'));
    image.src = dataUrl;
});

const estimateDataUrlBytes = (dataUrl) => {
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) {
        return 0;
    }
    const base64Length = dataUrl.length - commaIndex - 1;
    return Math.floor((base64Length * 3) / 4);
};

const normalizeImageForUpload = async (file) => {
    const sourceDataUrl = await readFileAsDataUrl(file);
    const image = await loadImageElement(sourceDataUrl);

    const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(image.width, image.height));
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Unable to process image in browser. Please try another image.');
    }
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    let quality = 0.9;
    let outputDataUrl = canvas.toDataURL('image/jpeg', quality);
    while (estimateDataUrlBytes(outputDataUrl) > MAX_DECODED_UPLOAD_BYTES && quality > 0.45) {
        quality -= 0.1;
        outputDataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    if (estimateDataUrlBytes(outputDataUrl) > MAX_DECODED_UPLOAD_BYTES) {
        throw new Error('Image is too large after compression. Please use a smaller or lower-resolution photo.');
    }

    return outputDataUrl;
};

const StartAssessment = ({ onComplete }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [lead, setLead] = useState(INITIAL_LEAD);
    const [answers, setAnswers] = useState(INITIAL_ANSWERS);
    const [submitting, setSubmitting] = useState(false);
    const [analysisStageIndex, setAnalysisStageIndex] = useState(0);
    const [analysisProgress, setAnalysisProgress] = useState(8);
    const [imageData, setImageData] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

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
            toast.error('Your browser does not support camera capture. Please upload a photo instead.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            streamRef.current = stream;
            setCameraActive(true);
        } catch (error) {
            toast.error('We could not access your camera. Please allow permissions or upload a photo.');
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
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const context = canvas.getContext('2d');
        if (!context) {
            toast.error('Capture failed. Please try again or upload a photo.');
            return;
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageData(dataUrl);
        stopCamera();
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file.');
            event.target.value = '';
            return;
        }

        try {
            const normalizedImageData = await normalizeImageForUpload(file);
            setImageData(normalizedImageData);
            stopCamera();
        } catch (error) {
            toast.error(error?.message || 'Could not process this image. Please try another one.');
        }

        event.target.value = '';
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
            setAnalysisStageIndex((prev) => Math.min(prev + 1, ANALYSIS_STAGES.length - 1));
            setAnalysisProgress((prev) => Math.min(prev + 24, 96));
        }, 1400);

        return () => clearInterval(interval);
    }, [submitting]);

    const handleNext = () => {
        if (!stepIsValid) {
            toast.error('Please complete this section before continuing.');
            return;
        }
        setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const handleBack = () => {
        setStepIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        if (!stepIsValid) {
            toast.error('Please review the details before finishing.');
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
            setAnalysisStageIndex(ANALYSIS_STAGES.length - 1);
            setAnalysisProgress(100);
            onComplete({
                lead: payload.lead,
                answers: payload.answers,
                analysis: data,
                image: imageData,
            });
        } catch (error) {
            const message = error?.message || 'We could not generate the plan. Please try again.';
            toast.error(message);
            setSubmitting(false);
        }
    };
    // About You
    const renderAboutStep = () => (
        <div className="mx-auto max-w-4xl space-y-12 px-4 py-8">
            {/* Header Section with improved hierarchy */}
            <div className="space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Tell us about yourself
                </h2>
                <p className="mx-auto max-w-2xl text-base text-slate-600">
                    Your information helps us create personalized skincare recommendations tailored just for you.
                    All data is encrypted and stored securely.
                </p>
            </div>

            {/* Form Fields with enhanced styling */}
            <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Full Name Field */}
                    <label className="group space-y-2.5 text-left">
                        <span className="flex items-center text-sm font-semibold text-slate-700">
                            Full Name
                            <span className="ml-1 text-red-500">*</span>
                        </span>
                        <div className="relative">
                            <input
                                type="text"
                                value={lead.name}
                                onChange={(event) => handleLeadChange('name', event.target.value)}
                                placeholder="John Doe"
                                className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#97b94f] focus:outline-none focus:ring-4 focus:ring-[#97b94f]/10"
                                required
                            />
                        </div>
                    </label>

                    {/* Age Field */}
                    <label className="group space-y-2.5 text-left">
                        <span className="flex items-center text-sm font-semibold text-slate-700">
                            Age
                            <span className="ml-1 text-red-500">*</span>
                        </span>
                        <div className="relative">
                            <input
                                type="number"
                                min={13}
                                max={90}
                                value={lead.age}
                                onChange={(event) => handleLeadChange('age', event.target.value)}
                                placeholder="24"
                                className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#97b94f] focus:outline-none focus:ring-4 focus:ring-[#97b94f]/10"
                                required
                            />
                        </div>
                    </label>

                    {/* Phone Field */}
                    <label className="group space-y-2.5 text-left">
                        <span className="flex items-center text-sm font-semibold text-slate-700">
                            Phone Number
                            <span className="ml-1 text-red-500">*</span>
                        </span>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <input
                                type="tel"
                                value={lead.phone}
                                onChange={(event) => handleLeadChange('phone', event.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full rounded-lg border-2 border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#97b94f] focus:outline-none focus:ring-4 focus:ring-[#97b94f]/10"
                                required
                            />
                        </div>
                    </label>

                    {/* Gender Field - Full width on mobile, half on desktop */}
                    <div className="space-y-2.5 text-left md:col-span-2">
                        <span className="flex items-center text-sm font-semibold text-slate-700">
                            Gender
                            <span className="ml-1 text-red-500">*</span>
                        </span>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { value: 'female', label: 'Female', icon: '♀' },
                                { value: 'male', label: 'Male', icon: '♂' },
                                { value: 'non-binary', label: 'Non-binary', icon: '⚥' },
                                { value: 'prefer-not', label: 'Prefer not to say', icon: '•' },
                            ].map((option) => (
                                <button
                                    type="button"
                                    key={option.value}
                                    onClick={() => handleLeadChange('gender', option.value)}
                                    className={`group relative overflow-hidden rounded-xl border-2 px-4 py-4 text-sm font-semibold shadow-sm transition-all duration-200 ${lead.gender === option.value
                                        ? 'border-[#97b94f] bg-gradient-to-br from-[#f0f5e3] to-[#e8f0d5] text-slate-900 shadow-md'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-[#b7cc79] hover:bg-slate-50 hover:shadow-md'
                                        }`}
                                >
                                    <span className="relative z-10 flex flex-col items-center gap-1">
                                        <span className="text-lg">{option.icon}</span>
                                        <span>{option.label}</span>
                                    </span>
                                    {lead.gender === option.value && (
                                        <div className="absolute right-2 top-2">
                                            <svg className="h-5 w-5 text-[#97b94f]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Notice with icon */}
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-[#97b94f]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700">Your privacy is protected</p>
                        <p className="mt-1 text-xs text-slate-600">
                            We use industry-standard encryption and never share your personal information without explicit consent.
                            <a href="#" className="ml-1 font-medium text-[#97b94f] hover:underline">Learn more</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );


    const renderSkinStep = () => (
        <div className="mx-auto max-w-5xl space-y-12 px-4 py-8">
            {/* Header Section */}
            <div className="space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Let's decode your skin
                </h2>
                <p className="mx-auto max-w-2xl text-base text-slate-600">
                    Understanding your unique skin profile helps us recommend treatments and products perfectly suited to your needs.
                </p>
            </div>

            {/* Primary Concern Section */}
            <div className="space-y-5">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#97b94f] text-sm font-bold text-white">
                        1
                    </div>
                    <div>
                        <span className="text-base font-bold text-slate-900">Optional Skin Goals</span>
                        <p className="text-sm text-slate-500">What would you like to improve? (Optional - for recommendations only)</p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {CONCERN_OPTIONS.map((option) => (
                        <button
                            type="button"
                            key={option.value}
                            onClick={() => handleAnswerChange('main_concern', option.value)}
                            className={`group relative overflow-hidden rounded-xl border-2 px-5 py-4 text-center text-sm font-semibold shadow-sm transition-all duration-200 ${answers.main_concern === option.value
                                ? 'border-[#97b94f] bg-gradient-to-br from-[#f0f5e3] to-[#e8f0d5] text-slate-900 shadow-md ring-2 ring-[#97b94f]/20'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-[#b7cc79] hover:bg-slate-50 hover:shadow-md'
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {option.label}
                                {answers.main_concern === option.value && (
                                    <svg className="h-4 w-4 text-[#97b94f]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sensitivity Section */}
            <div className="space-y-5">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#97b94f] text-sm font-bold text-white">
                        2
                    </div>
                    <div>
                        <span className="text-base font-bold text-slate-900">Sensitivity Level</span>
                        <p className="text-sm text-slate-500">How reactive is your skin?</p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {SENSITIVITY_OPTIONS.map((option) => (
                        <button
                            type="button"
                            key={option.value}
                            onClick={() => handleAnswerChange('sensitivity', option.value)}
                            className={`group relative overflow-hidden rounded-xl border-2 px-5 py-5 text-center text-sm font-semibold shadow-sm transition-all duration-200 ${answers.sensitivity === option.value
                                ? 'border-[#97b94f] bg-gradient-to-br from-[#f0f5e3] to-[#e8f0d5] text-slate-900 shadow-md ring-2 ring-[#97b94f]/20'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-[#b7cc79] hover:bg-slate-50 hover:shadow-md'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                {/* Sensitivity indicator dots */}
                                <div className="flex gap-1">
                                    {[...Array(option.value === 'none' ? 1 : option.value === 'mild' ? 2 : option.value === 'moderate' ? 3 : 4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 w-2 rounded-full transition-colors ${answers.sensitivity === option.value
                                                ? 'bg-[#97b94f]'
                                                : 'bg-slate-300 group-hover:bg-slate-400'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="relative z-10">{option.label}</span>
                                {answers.sensitivity === option.value && (
                                    <svg className="h-4 w-4 text-[#97b94f]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Progress indicator */}
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 flex-shrink-0 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Tip:</span> Not sure about your skin type? Choose what feels most accurate—our specialists can refine this during your consultation.
                    </p>
                </div>
            </div>
        </div>
    );


    const renderLifestyleStep = () => {
        const lifestyleFields = [
            {
                key: 'sleep',
                title: 'Sleep Routine',
                subtitle: 'How many hours do you typically sleep per night?',
                icon: '😴',
                step: 1
            },
            {
                key: 'stress',
                title: 'Stress Levels',
                subtitle: 'How would you describe your daily stress?',
                icon: '🧘',
                step: 2
            },
            {
                key: 'water',
                title: 'Water Intake',
                subtitle: 'How much water do you drink daily?',
                icon: '💧',
                step: 3
            },
            {
                key: 'diet',
                title: 'Diet Quality',
                subtitle: 'How would you rate your eating habits?',
                icon: '🥗',
                step: 4
            }
        ];

        return (
            <div className="mx-auto max-w-4xl space-y-12 px-4 py-8">
                {/* Header Section */}
                <div className="space-y-4 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Your lifestyle, decoded
                    </h2>
                    <p className="mx-auto max-w-2xl text-base text-slate-600">
                        Your daily habits play a crucial role in skin health. Help us understand your routine so we can recommend holistic solutions.
                    </p>
                </div>

                {/* Lifestyle Questions */}
                <div className="space-y-8">
                    {lifestyleFields.map((field) => (
                        <div key={field.key} className="space-y-4">
                            {/* Section Header with Icon and Step Number */}
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#97b94f] to-[#7a9a3f] text-sm font-bold text-white shadow-md">
                                    {field.step}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{field.icon}</span>
                                        <h3 className="text-lg font-bold text-slate-900">{field.title}</h3>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600">{field.subtitle}</p>
                                </div>
                            </div>

                            {/* Options Grid */}
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {LIFESTYLE_OPTIONS[field.key].map((option) => (
                                    <button
                                        type="button"
                                        key={option.value}
                                        onClick={() => handleAnswerChange(field.key, option.value)}
                                        className={`group relative overflow-hidden rounded-xl border-2 px-5 py-4 text-left shadow-sm transition-all duration-200 ${answers[field.key] === option.value
                                            ? 'border-[#97b94f] bg-gradient-to-br from-[#f0f5e3] to-[#e8f0d5] shadow-md ring-2 ring-[#97b94f]/20'
                                            : 'border-slate-200 bg-white hover:border-[#b7cc79] hover:bg-slate-50 hover:shadow-md'
                                            }`}
                                    >
                                        {/* Selection Indicator */}
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-semibold transition-colors ${answers[field.key] === option.value
                                                ? 'text-slate-900'
                                                : 'text-slate-700'
                                                }`}>
                                                {option.label}
                                            </span>

                                            {answers[field.key] === option.value && (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#97b94f]">
                                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Optional: Add description if you have it in your options */}
                                        {option.description && (
                                            <p className="mt-2 text-xs text-slate-600">{option.description}</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Wellness Tips Section */}
                <div className="space-y-4">
                    <div className="rounded-xl border-2 border-[#97b94f]/30 bg-gradient-to-br from-[#f0f5e3] to-white p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#97b94f]">
                                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900">Holistic Skincare Approach</h4>
                                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                                    Great skin isn't just about products—it's about balance. We'll combine your lifestyle insights with targeted treatments for optimal results.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips Grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="text-2xl">💤</span>
                            <div>
                                <p className="text-xs font-semibold text-slate-900">Sleep Tip</p>
                                <p className="mt-1 text-xs text-slate-600">7-9 hours promotes cell regeneration</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="text-2xl">💧</span>
                            <div>
                                <p className="text-xs font-semibold text-slate-900">Hydration Tip</p>
                                <p className="mt-1 text-xs text-slate-600">8 glasses daily keeps skin plump</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Privacy Reminder */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Your lifestyle data is private and used only to personalize your skincare journey.</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderScanStep = () => (
        <div className="mx-auto max-w-5xl space-y-12 px-4 py-8">
            {/* Header Section */}
            <div className="space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Capture your skin's story
                </h2>
                <p className="mx-auto max-w-2xl text-base text-slate-600">
                    Our AI-powered analysis will examine your skin's tone, texture, and unique characteristics to provide personalized recommendations.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Tips Card - Left Side */}
                <div className="space-y-6">
                    {/* Main Tips Card */}
                    <div className="rounded-2xl border-2 border-[#97b94f]/30 bg-gradient-to-br from-[#f0f5e3] to-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#97b94f]">
                                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Pro Tips for Best Results</h3>
                        </div>

                        <ul className="space-y-3">
                            {[
                                { icon: '☀️', text: 'Use natural daylight near a window—avoid harsh overhead lights' },
                                { icon: '🧼', text: 'Remove makeup and cleanse your face for accurate texture analysis' },
                                { icon: '📸', text: 'Keep your face centered and camera steady to avoid blur' },
                                { icon: '😊', text: 'Neutral expression works best—no squinting or smiling' }
                            ].map((tip, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                                        {tip.icon}
                                    </span>
                                    <span className="pt-1 text-sm leading-relaxed text-slate-700">{tip.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* AI Feature Highlight */}
                    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 7H7v6h6V7z" />
                                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">AI-Powered Analysis</h4>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                    Our advanced technology analyzes skin tone, texture, pores, and potential concerns with clinical-grade accuracy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload/Camera Section - Right Side */}
                <div className="space-y-5">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <label className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-[#97b94f] bg-white px-6 py-3.5 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-[#7ea531] hover:bg-[#f0f5e3] hover:shadow-md">
                            <Upload className="h-5 w-5 text-[#97b94f]" />
                            <span className="text-sm">Upload Photo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>

                        <Button
                            variant="secondary"
                            onClick={cameraActive ? stopCamera : startCamera}
                            className={`inline-flex items-center gap-2 rounded-xl border-2 px-6 py-3.5 text-sm font-semibold shadow-sm transition-all duration-200 ${cameraActive
                                ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md'
                                }`}
                        >
                            <Camera className="h-5 w-5" />
                            {cameraActive ? 'Stop Camera' : 'Use Webcam'}
                        </Button>

                        {imageData && (
                            <Button
                                variant="ghost"
                                onClick={() => setImageData(null)}
                                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                            >
                                <RefreshCcw className="h-5 w-5" />
                                Reset
                            </Button>
                        )}
                    </div>

                    {/* Preview/Camera Area */}
                    <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-lg">
                        {cameraActive ? (
                            <div className="space-y-4 p-4">
                                <div className="relative overflow-hidden rounded-xl">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full rounded-xl bg-black shadow-inner"
                                    />
                                    {/* Camera overlay guide */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-64 w-64 rounded-full border-4 border-dashed border-white/40"></div>
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={capturePhoto}
                                    className="w-full rounded-xl bg-gradient-to-r from-[#97b94f] to-[#7ea531] py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Capture Photo
                                    </span>
                                </Button>
                            </div>
                        ) : imageData ? (
                            <div className="space-y-3 p-4">
                                <div className="relative overflow-hidden rounded-xl">
                                    <img
                                        src={imageData}
                                        alt="Skin preview"
                                        className="w-full rounded-xl object-cover shadow-inner"
                                    />
                                    {/* Success checkmark overlay */}
                                    <div className="absolute right-3 top-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-lg">
                                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
                                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-semibold text-green-900">Photo uploaded successfully</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-80 flex-col items-center justify-center p-8 text-center">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                    <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">No photo yet</h4>
                                <p className="mt-2 max-w-xs text-sm text-slate-600">
                                    Upload a clear photo or use your webcam to begin your personalized skin analysis
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Privacy Notice */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start gap-2">
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs leading-relaxed text-slate-600">
                                Your photo is encrypted and analyzed securely. We never share your images without consent.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );


    const renderSummaryStep = () => (
        <div className="space-y-10">
            <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-slate-800">All set! Let&apos;s build your personalised regimen.</h2>
                <p className="text-sm text-slate-600">Review the details below. You can go back if you need to make edits.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">You</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                        <li><span className="font-medium">Name:</span> {lead.name || '—'}</li>
                        <li><span className="font-medium">Age:</span> {lead.age || '—'}</li>
                        <li><span className="font-medium">Phone:</span> {lead.phone || '—'}</li>
                        <li><span className="font-medium">Gender:</span> {lead.gender || '—'}</li>
                    </ul>
                </Card>

                <Card className="border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Skin Focus</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                        <li><span className="font-medium">Primary Concern:</span> {answers.main_concern || '—'}</li>
                        <li><span className="font-medium">Sensitivity:</span> {answers.sensitivity || '—'}</li>
                    </ul>
                </Card>

                <Card className="border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Lifestyle Snapshot</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-[#f9fafb] p-4 text-sm text-slate-700">
                            <span className="font-medium text-slate-900">Sleep:</span> {answers.sleep || '—'}
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-[#f9fafb] p-4 text-sm text-slate-700">
                            <span className="font-medium text-slate-900">Stress:</span> {answers.stress || '—'}
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-[#f9fafb] p-4 text-sm text-slate-700">
                            <span className="font-medium text-slate-900">Water:</span> {answers.water || '—'}
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-[#f9fafb] p-4 text-sm text-slate-700">
                            <span className="font-medium text-slate-900">Diet:</span> {answers.diet || '—'}
                        </div>
                    </div>
                </Card>

                <Card className="border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Skin Scan</h3>
                    {imageData ? (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-[#f9fafb] p-4">
                            <img src={imageData} alt="Skin scan preview" className="w-full rounded-2xl object-cover" />
                            <p className="mt-3 text-sm text-slate-600">We will use this photo to tailor your regimen.</p>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-slate-600">No image provided.</p>
                    )}
                </Card>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f5f6f4]">
            <header className="sticky top-0 z-50 border-b border-emerald-100 bg-gradient-to-br from-white via-teal-50 to-emerald-100 py-1 shadow-sm">
                <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">

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
                            className="group flex items-center gap-2 rounded-lg border-2 border-emerald-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-md sm:px-4"
                        >
                            <svg className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">Exit</span>
                        </a>
                    </div>
                </nav>
            </header>



            <section className="mx-auto max-w-5xl px-6 py-12">
                <div className="rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
                    <div className="border-b border-[#e5e7eb] bg-[#f7f8f9] px-8 py-6">
                        <div className="flex flex-wrap gap-3">
                            {STEPS.map((step, index) => {
                                const isActive = index === stepIndex;
                                const isCompleted = index < stepIndex;
                                return (
                                    <div
                                        key={step.id}
                                        className={`rounded-2xl px-5 py-2 text-sm font-semibold transition ${isActive
                                            ? 'bg-[#97b94f] text-white'
                                            : isCompleted
                                                ? 'bg-[#d9dfc3] text-slate-700'
                                                : 'bg-[#eaedf3] text-slate-600'
                                            }`}
                                    >
                                        {step.label}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-5 h-2 w-full rounded-full bg-[#e2e6eb]">
                            <div
                                className="h-full rounded-full bg-[#97b94f] transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="mt-1 text-right text-xs font-semibold text-slate-500">{progress}%</div>
                    </div>

                    <div className="px-8 py-10">
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

                    <div className="flex flex-col gap-4 border-t border-[#e5e7eb] bg-[#f7f8f9] px-8 py-6 md:flex-row md:items-center md:justify-between">
                        <div className="text-sm text-slate-500">
                            Step {stepIndex + 1} of {STEPS.length} · {STEPS[stepIndex].subtitle}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={stepIndex === 0 || submitting}
                                icon={ArrowLeft}
                                iconPosition="left"
                                className="text-slate-600 hover:bg-[#e5e7eb]"
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
                                    className="bg-[#5d5f63] uppercase tracking-wide hover:bg-[#4d4f52]"
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
                                    className="bg-[#5d5f63] uppercase tracking-wide hover:bg-[#4d4f52]"
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
