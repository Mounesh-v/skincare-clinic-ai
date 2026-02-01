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
	skin_type: '',
	main_concern: '',
	sensitivity: '',
	sleep: '',
	stress: '',
	water: '',
	diet: '',
};

const SKIN_TYPE_OPTIONS = [
	{ value: 'oily', label: 'Oily', description: 'Shiny T-zone, clogged pores' },
	{ value: 'dry', label: 'Dry', description: 'Feels tight or flaky' },
	{ value: 'combination', label: 'Combination', description: 'Oily T-zone, dry cheeks' },
	{ value: 'sensitive', label: 'Sensitive', description: 'Redness or irritation' },
	{ value: 'normal', label: 'Normal', description: 'Balanced overall' },
];

const CONCERN_OPTIONS = [
	{ value: 'acne', label: 'Acne & Breakouts' },
	{ value: 'pigmentation', label: 'Dark Spots & Pigmentation' },
	{ value: 'wrinkles', label: 'Fine Lines & Wrinkles' },
	{ value: 'dullness', label: 'Dullness & Uneven Tone' },
	{ value: 'dark_circles', label: 'Dark Circles & Puffiness' },
	{ value: 'rashes', label: 'Rashes & Irritation' },
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

const StartAssessment = ({ onComplete }) => {
	const [stepIndex, setStepIndex] = useState(0);
	const [lead, setLead] = useState(INITIAL_LEAD);
	const [answers, setAnswers] = useState(INITIAL_ANSWERS);
	const [submitting, setSubmitting] = useState(false);
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
			return answers.skin_type && answers.main_concern;
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

	const handleFileUpload = (event) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}
		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file.');
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setImageData(reader.result);
			stopCamera();
		};
		reader.readAsDataURL(file);
		event.target.value = '';
	};

	useEffect(() => {
		if (stepIndex !== 3) {
			stopCamera();
		}
		return () => stopCamera();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stepIndex]);

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
				answers: {
					...answers,
					age: lead.age.trim(),
					gender: lead.gender,
					phone: lead.phone.trim() || undefined,
				},
				image_data: imageData,
			};

			const data = await analyzeAssessment(payload);
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

	const renderAboutStep = () => (
		<div className="space-y-10">
			<div className="space-y-3">
				<h2 className="text-2xl font-semibold text-slate-800">Before we start, tell us about you.</h2>
				<p className="text-sm text-slate-600">Your data stays private and helps us personalise every recommendation.</p>
			</div>

			<div className="grid gap-8 md:grid-cols-2">
				<label className="space-y-2 text-left">
					<span className="text-sm font-medium text-slate-700">Full Name</span>
					<input
						type="text"
						value={lead.name}
						onChange={(event) => handleLeadChange('name', event.target.value)}
						placeholder="Enter your name"
						className="w-full border-b-2 border-slate-300 bg-transparent px-1 pb-2 text-base focus:border-[#97b94f] focus:outline-none"
					/>
				</label>

				<label className="space-y-2 text-left">
					<span className="text-sm font-medium text-slate-700">Age</span>
					<input
						type="number"
						min={13}
						max={90}
						value={lead.age}
						onChange={(event) => handleLeadChange('age', event.target.value)}
						placeholder="24"
						className="w-full border-b-2 border-slate-300 bg-transparent px-1 pb-2 text-base focus:border-[#97b94f] focus:outline-none"
					/>
				</label>

				<label className="space-y-2 text-left">
					<span className="text-sm font-medium text-slate-700">Phone Number</span>
					<input
						type="tel"
						value={lead.phone}
						onChange={(event) => handleLeadChange('phone', event.target.value)}
						placeholder="Enter your phone"
						className="w-full border-b-2 border-slate-300 bg-transparent px-1 pb-2 text-base focus:border-[#97b94f] focus:outline-none"
					/>
				</label>

				<div className="space-y-2 text-left">
					<span className="text-sm font-medium text-slate-700">Gender</span>
					<div className="grid grid-cols-2 gap-3">
						{[
							{ value: 'female', label: 'Female' },
							{ value: 'male', label: 'Male' },
							{ value: 'non-binary', label: 'Non-binary' },
							{ value: 'prefer-not', label: 'Prefer not to say' },
						].map((option) => (
							<button
								type="button"
								key={option.value}
								onClick={() => handleLeadChange('gender', option.value)}
								className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
									lead.gender === option.value
										? 'border-[#97b94f] bg-[#f0f5e3] text-slate-800'
										: 'border-slate-300 bg-white text-slate-600 hover:border-[#b7cc79]'
								}`}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
			</div>

			<p className="text-xs text-slate-500">
				*Your data is safe with strict privacy standards. We never share without consent.
			</p>
		</div>
	);

	const renderSkinStep = () => (
		<div className="space-y-10">
			<div className="space-y-3">
				<h2 className="text-2xl font-semibold text-slate-800">Let&apos;s decode your skin behaviour.</h2>
				<p className="text-sm text-slate-600">Choose the options that best describe your current skin journey.</p>
			</div>

			<div className="space-y-3">
				<span className="text-sm font-semibold uppercase tracking-wide text-slate-500">Skin Type</span>
				<div className="grid gap-4 md:grid-cols-2">
					{SKIN_TYPE_OPTIONS.map((option) => (
						<button
							type="button"
							key={option.value}
							onClick={() => handleAnswerChange('skin_type', option.value)}
							className={`rounded-2xl border p-5 text-left transition ${
								answers.skin_type === option.value
									? 'border-[#97b94f] bg-[#f0f5e3] text-slate-800 shadow-sm'
									: 'border-slate-300 bg-white text-slate-600 hover:border-[#b7cc79]'
							}`}
						>
							<div className="text-lg font-semibold">{option.label}</div>
							<p className="mt-2 text-sm text-slate-600">{option.description}</p>
						</button>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<span className="text-sm font-semibold uppercase tracking-wide text-slate-500">Primary Concern</span>
				<div className="grid gap-3 md:grid-cols-3">
					{CONCERN_OPTIONS.map((option) => (
						<button
							type="button"
							key={option.value}
							onClick={() => handleAnswerChange('main_concern', option.value)}
							className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
								answers.main_concern === option.value
									? 'border-[#97b94f] bg-[#f0f5e3] text-slate-800'
									: 'border-slate-300 bg-white text-slate-600 hover:border-[#b7cc79]'
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<span className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sensitivity Triggers</span>
				<div className="grid gap-3 md:grid-cols-2">
					{SENSITIVITY_OPTIONS.map((option) => (
						<button
							type="button"
							key={option.value}
							onClick={() => handleAnswerChange('sensitivity', option.value)}
							className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
								answers.sensitivity === option.value
									? 'border-[#97b94f] bg-[#f0f5e3] text-slate-800'
									: 'border-slate-300 bg-white text-slate-600 hover:border-[#b7cc79]'
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);

	const renderLifestyleStep = () => (
		<div className="space-y-10">
			<div className="space-y-3">
				<h2 className="text-2xl font-semibold text-slate-800">Daily rhythms that impact your glow.</h2>
				<p className="text-sm text-slate-600">Honest answers ensure we balance lifestyle with topical care.</p>
			</div>

			{Object.entries(LIFESTYLE_OPTIONS).map(([field, options]) => (
				<div key={field} className="space-y-3">
					<span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
						{field === 'sleep' && 'Sleep Routine'}
						{field === 'stress' && 'Stress Levels'}
						{field === 'water' && 'Water Intake'}
						{field === 'diet' && 'Diet Quality'}
					</span>
					<div className="grid gap-3 md:grid-cols-2">
						{options.map((option) => (
							<button
								type="button"
								key={option.value}
								onClick={() => handleAnswerChange(field, option.value)}
								className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
									answers[field] === option.value
										? 'border-[#97b94f] bg-[#f0f5e3] text-slate-800'
										: 'border-slate-300 bg-white text-slate-600 hover:border-[#b7cc79]'
								}`}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
			))}
		</div>
	);

	const renderScanStep = () => (
		<div className="space-y-10">
			<div className="space-y-3">
				<h2 className="text-2xl font-semibold text-slate-800">Let&apos;s capture your skin texture.</h2>
				<p className="text-sm text-slate-600">Upload a clear photo or use your webcam so we can analyse tone and texture.</p>
			</div>

			<div className="grid gap-8 md:grid-cols-2">
				<Card className="border border-slate-200 bg-[#f9fafb] p-6 shadow-sm">
					<h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tips for best results</h3>
					<ul className="mt-4 space-y-2 text-sm text-slate-600">
						<li>Stand near natural light and keep your face centered.</li>
						<li>Remove heavy makeup to let the AI check true skin texture.</li>
						<li>Avoid blurry photos—steady your hand or rely on the capture button.</li>
					</ul>
				</Card>

				<div className="space-y-4">
					<div className="flex flex-wrap items-center gap-3">
						<label className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#97b94f] bg-white px-4 py-3 text-sm font-medium text-[#5d5f63] hover:border-[#7ea531] cursor-pointer">
							<Upload className="h-4 w-4" />
							Upload photo
							<input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
						</label>
						<Button
							variant="secondary"
							onClick={cameraActive ? stopCamera : startCamera}
							icon={Camera}
							className="bg-white text-[#5d5f63] hover:bg-[#f0f1f3]"
						>
							{cameraActive ? 'Stop camera' : 'Use webcam'}
						</Button>
						{imageData && (
							<Button
								variant="ghost"
								onClick={() => setImageData(null)}
								icon={RefreshCcw}
								className="text-slate-600 hover:bg-[#e5e7eb]"
							>
								Choose again
							</Button>
						)}
					</div>

					<div className="rounded-3xl border border-slate-200 bg-[#f9fafb] p-4">
						{cameraActive ? (
							<div className="space-y-4">
								<video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl bg-black/10" />
								<Button
									variant="primary"
									onClick={capturePhoto}
									className="bg-[#5d5f63] uppercase tracking-wide hover:bg-[#4d4f52]"
								>
									Capture photo
								</Button>
							</div>
						) : imageData ? (
							<div className="space-y-2">
								<img src={imageData} alt="Skin preview" className="w-full rounded-2xl object-cover" />
								<span className="text-sm font-medium text-slate-600">Your submitted image</span>
							</div>
						) : (
							<div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfd6e3] bg-white text-center text-sm text-slate-500">
								Upload or capture a clear photo to continue.
							</div>
						)}
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
						<li><span className="font-medium">Skin Type:</span> {answers.skin_type || '—'}</li>
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
			<header className="bg-[#303236] py-4 text-white">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-6">
					<div>
						<div className="text-2xl font-semibold">SkinSync.</div>
						<p className="text-xs text-white/70">This skin test is co-created with dermatologists.</p>
					</div>
					<a href="/" className="text-sm font-semibold text-white/80 hover:text-white transition">Exit</a>
				</div>
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
										className={`rounded-2xl px-5 py-2 text-sm font-semibold transition ${
											isActive
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
									Generate My Plan
								</Button>
							)}
						</div>
					</div>
				</div>
			</section>

			{submitting && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
					<div className="rounded-2xl bg-white px-6 py-4 text-slate-900 shadow-xl">
						Crafting your dermatologist-backed plan...
					</div>
				</div>
			)}
		</div>
	);
};

export default StartAssessment;
