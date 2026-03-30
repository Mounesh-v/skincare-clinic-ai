import React, { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Shield,
  Users,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const SkinAssessmentQuiz = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  const questions = [
    {
      id: "main_concern",
      question: "What is your main skin concern?",
      subtitle:
        "What would you like to improve? (Optional - for recommendations only)",
      type: "single-choice",
      options: [
        {
          id: "acne",
          label: "Acne & Breakouts",
          icon: "🔴",
          description: "Pimples, blemishes, or oily skin",
        },
        {
          id: "pigmentation",
          label: "Dark Spots & Pigmentation",
          icon: "🟤",
          description: "Uneven skin tone or dark patches",
        },
        {
          id: "wrinkles",
          label: "Fine Lines & Wrinkles",
          icon: "👵",
          description: "Signs of aging or loss of elasticity",
        },
        {
          id: "dullness",
          label: "Dull & Uneven Skin",
          icon: "😐",
          description: "Lack of glow or radiance",
        },
        {
          id: "dark_circles",
          label: "Dark Circles & Puffiness",
          icon: "😴",
          description: "Under-eye concerns",
        },
        {
          id: "rashes",
          label: "Rashes & Irritation",
          icon: "🔥",
          description: "Sensitive or reactive skin",
        },
        {
          id: "none",
          label: "No specific concern",
          icon: "✨",
          description: "General maintenance",
        },
      ],
    },
    {
      id: "gender",
      question: "What is your gender?",
      subtitle: "This helps us personalize your treatment",
      type: "single-choice",
      options: [
        {
          id: "male",
          label: "Male",
          icon: "👨",
          description: "Male skincare needs",
        },
        {
          id: "female",
          label: "Female",
          icon: "👩",
          description: "Female skincare needs",
        },
        {
          id: "other",
          label: "Other",
          icon: "🧑",
          description: "Personalized approach",
        },
      ],
    },
    {
      id: "age",
      question: "What is your age?",
      subtitle: "Age affects skin needs and treatment approach",
      type: "single-choice",
      options: [
        {
          id: "13-20",
          label: "13-20 years",
          icon: "🧒",
          description: "Teen skincare",
        },
        {
          id: "21-30",
          label: "21-30 years",
          icon: "👤",
          description: "Young adult care",
        },
        {
          id: "31-40",
          label: "31-40 years",
          icon: "👨‍💼",
          description: "Prevention focus",
        },
        {
          id: "41-50",
          label: "41-50 years",
          icon: "👨‍🦳",
          description: "Anti-aging care",
        },
        {
          id: "50+",
          label: "50+ years",
          icon: "👴",
          description: "Mature skin care",
        },
      ],
    },
    {
      id: "sleep",
      question: "How many hours do you sleep daily?",
      subtitle: "Sleep quality affects skin health significantly",
      type: "single-choice",
      options: [
        {
          id: "less-5",
          label: "Less than 5 hours",
          icon: "😴",
          description: "Insufficient rest",
        },
        {
          id: "5-6",
          label: "5-6 hours",
          icon: "😪",
          description: "Below recommended",
        },
        {
          id: "7-8",
          label: "7-8 hours",
          icon: "😊",
          description: "Optimal sleep",
        },
        {
          id: "more-8",
          label: "More than 8 hours",
          icon: "😌",
          description: "Well rested",
        },
      ],
    },
    {
      id: "stress",
      question: "How would you rate your stress levels?",
      subtitle: "Stress is a major factor in skin conditions",
      type: "single-choice",
      options: [
        { id: "low", label: "Low", icon: "😌", description: "Rarely stressed" },
        {
          id: "moderate",
          label: "Moderate",
          icon: "😐",
          description: "Sometimes stressed",
        },
        {
          id: "high",
          label: "High",
          icon: "😰",
          description: "Often stressed",
        },
        {
          id: "very-high",
          label: "Very High",
          icon: "😵",
          description: "Constantly stressed",
        },
      ],
    },
    {
      id: "diet",
      question: "How would you describe your diet?",
      subtitle: "Nutrition plays a crucial role in skin health",
      type: "single-choice",
      options: [
        {
          id: "balanced",
          label: "Balanced & Healthy",
          icon: "🥗",
          description: "Lots of fruits & vegetables",
        },
        {
          id: "mostly-healthy",
          label: "Mostly Healthy",
          icon: "🍎",
          description: "Generally good choices",
        },
        {
          id: "average",
          label: "Average",
          icon: "🍽️",
          description: "Mixed diet",
        },
        {
          id: "unhealthy",
          label: "Needs Improvement",
          icon: "🍔",
          description: "Mostly processed food",
        },
      ],
    },
    {
      id: "water",
      question: "How much water do you drink daily?",
      subtitle: "Hydration is essential for healthy skin",
      type: "single-choice",
      options: [
        {
          id: "less-2",
          label: "Less than 2 glasses",
          icon: "💧",
          description: "Very low hydration",
        },
        {
          id: "2-4",
          label: "2-4 glasses",
          icon: "💦",
          description: "Below recommended",
        },
        {
          id: "5-8",
          label: "5-8 glasses",
          icon: "🌊",
          description: "Recommended amount",
        },
        {
          id: "more-8",
          label: "More than 8 glasses",
          icon: "💙",
          description: "Well hydrated",
        },
      ],
    },
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    if (selectedOption) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: selectedOption,
      });

      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedOption(answers[questions[currentStep + 1]?.id] || null);
      } else {
        if (typeof onComplete === "function") {
          onComplete({ ...answers, [currentQuestion.id]: selectedOption });
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedOption(answers[questions[currentStep - 1]?.id] || null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-900">
                Question {currentStep + 1} of {questions.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-600">
                {Math.round(progress)}%
              </span>
              <span className="hidden sm:inline text-sm text-slate-600">
                Complete
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Question Card */}
        <div className="mb-8 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10">
            {/* Question Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-4">
                <Award className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  AI-Powered Analysis
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 leading-tight">
                {currentQuestion.question}
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                {currentQuestion.subtitle}
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`
                    group relative p-5 sm:p-6 rounded-xl border-2 text-left transition-all duration-300
                    ${
                      selectedOption === option.id
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl shadow-blue-500/20 scale-[1.02]"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:scale-[1.01]"
                    }
                  `}
                >
                  {/* Selection Indicator */}
                  {selectedOption === option.id && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-scaleIn">
                      <Check className="h-4 w-4 text-white stroke-[3]" />
                    </div>
                  )}

                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div
                      className={`
                      text-3xl sm:text-4xl flex-shrink-0 transition-transform duration-300
                      ${selectedOption === option.id ? "scale-110" : "group-hover:scale-105"}
                    `}
                    >
                      {option.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`
                        text-base sm:text-lg font-bold mb-1 transition-colors
                        ${selectedOption === option.id ? "text-blue-700" : "text-slate-900 group-hover:text-blue-600"}
                      `}
                      >
                        {option.label}
                      </h3>
                      {option.description && (
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  {selectedOption === option.id && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            leftIcon={<ChevronLeft className="h-5 w-5" />}
            className={`
              min-w-[100px] sm:min-w-[140px] px-4 sm:px-6 py-3 rounded-xl font-semibold
              ${
                currentStep === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-slate-100 hover:scale-105"
              }
              transition-all duration-200
            `}
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!selectedOption}
            rightIcon={
              currentStep === questions.length - 1 ? (
                <Check className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )
            }
            className={`
              min-w-[100px] sm:min-w-[140px] px-4 sm:px-6 py-3 rounded-xl font-bold
              bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg
              ${
                !selectedOption
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-blue-600 hover:to-purple-700 hover:shadow-xl hover:scale-105"
              }
              transition-all duration-200
            `}
          >
            {currentStep === questions.length - 1 ? (
              <>
                <span className="hidden sm:inline">Get Results</span>
                <span className="sm:hidden">Finish</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </>
            )}
          </Button>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index < currentStep || answers[questions[index]?.id]) {
                  setCurrentStep(index);
                  setSelectedOption(answers[questions[index]?.id] || null);
                }
              }}
              disabled={index > currentStep && !answers[questions[index]?.id]}
              className={`
                h-2 rounded-full transition-all duration-300 cursor-pointer
                ${
                  index === currentStep
                    ? "w-8 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                    : index < currentStep
                      ? "w-2 bg-blue-400 hover:w-3"
                      : "w-2 bg-slate-300"
                }
                ${index > currentStep && !answers[questions[index]?.id] ? "cursor-not-allowed" : ""}
              `}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">
                  100% Confidential
                </h4>
                <p className="text-sm text-slate-600">
                  Your data is encrypted & secure
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">
                  Doctor Verified
                </h4>
                <p className="text-sm text-slate-600">
                  AI + Expert dermatologist review
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">50,000+ Users</h4>
                <p className="text-sm text-slate-600">
                  Trusted by thousands daily
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@skincare.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              support@skincare.com
            </a>
          </p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default SkinAssessmentQuiz;
