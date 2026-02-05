import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import Button from "../../components/common/Button";
   import Card from "../../components/common/Card";
// import { ASSESSMENT_STEPS } from '../../utils/constants';



const SkinAssessmentQuiz = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  // Sample questions - expand this based on your needs
  const questions = [
    {
      id: 'main_concern',
      question: 'What is your main skin concern?',
      subtitle: 'Choose your primary concern (you can add more later)',
      type: 'single-choice',
      options: [
        { id: 'acne', label: 'Acne & Breakouts', icon: '🔴' },
        { id: 'pigmentation', label: 'Dark Spots & Pigmentation', icon: '🟤' },
        { id: 'wrinkles', label: 'Fine Lines & Wrinkles', icon: '👵' },
        { id: 'dullness', label: 'Dull & Uneven Skin', icon: '😐' },
        { id: 'dark_circles', label: 'Dark Circles & Puffiness', icon: '😴' },
        { id: 'rashes', label: 'Rashes & Irritation', icon: '🔥' },
      ]
    },
    {
      id: 'gender',
      question: 'What is your gender?',
      subtitle: 'This helps us personalize your treatment',
      type: 'single-choice',
      options: [
        { id: 'male', label: 'Male', icon: '👨' },
        { id: 'female', label: 'Female', icon: '👩' },
        { id: 'other', label: 'Other', icon: '🧑' },
      ]
    },
    {
      id: 'age',
      question: 'What is your age?',
      subtitle: 'Age affects skin needs and treatment approach',
      type: 'single-choice',
      options: [
        { id: '13-20', label: '13-20 years', icon: '🧒' },
        { id: '21-30', label: '21-30 years', icon: '👤' },
        { id: '31-40', label: '31-40 years', icon: '👨‍💼' },
        { id: '41-50', label: '41-50 years', icon: '👨‍🦳' },
        { id: '50+', label: '50+ years', icon: '👴' },
      ]
    },
    {
      id: 'sleep',
      question: 'How many hours do you sleep daily?',
      subtitle: 'Sleep quality affects skin health significantly',
      type: 'single-choice',
      options: [
        { id: 'less-5', label: 'Less than 5 hours', icon: '😴' },
        { id: '5-6', label: '5-6 hours', icon: '😪' },
        { id: '7-8', label: '7-8 hours', icon: '😊' },
        { id: 'more-8', label: 'More than 8 hours', icon: '😌' },
      ]
    },
    {
      id: 'stress',
      question: 'How would you rate your stress levels?',
      subtitle: 'Stress is a major factor in skin conditions',
      type: 'single-choice',
      options: [
        { id: 'low', label: 'Low - Rarely stressed', icon: '😌' },
        { id: 'moderate', label: 'Moderate - Sometimes stressed', icon: '😐' },
        { id: 'high', label: 'High - Often stressed', icon: '😰' },
        { id: 'very-high', label: 'Very High - Constantly stressed', icon: '😵' },
      ]
    },
    {
      id: 'diet',
      question: 'How would you describe your diet?',
      subtitle: 'Nutrition plays a crucial role in skin health',
      type: 'single-choice',
      options: [
        { id: 'balanced', label: 'Balanced & Healthy', icon: '🥗' },
        { id: 'mostly-healthy', label: 'Mostly Healthy', icon: '🍎' },
        { id: 'average', label: 'Average - Mixed', icon: '🍽️' },
        { id: 'unhealthy', label: 'Unhealthy - Fast Food', icon: '🍔' },
      ]
    },
    {
      id: 'water',
      question: 'How much water do you drink daily?',
      subtitle: 'Hydration is essential for healthy skin',
      type: 'single-choice',
      options: [
        { id: 'less-2', label: 'Less than 2 glasses', icon: '💧' },
        { id: '2-4', label: '2-4 glasses', icon: '💦' },
        { id: '5-8', label: '5-8 glasses (Recommended)', icon: '🌊' },
        { id: 'more-8', label: 'More than 8 glasses', icon: '💙' },
      ]
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
        [currentQuestion.id]: selectedOption
      });
      
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedOption(answers[questions[currentStep + 1]?.id] || null);
      } else {
        // Quiz complete
        onComplete({ ...answers, [currentQuestion.id]: selectedOption });
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-primary-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Question Card */}
          <Card className="mb-8 animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">
                {currentQuestion.question}
              </h2>
              <p className="text-lg text-slate-600">
                {currentQuestion.subtitle}
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`
                    relative p-6 rounded-xl border-2 text-left transition-all duration-300
                    ${selectedOption === option.id
                      ? 'border-primary-600 bg-primary-50 shadow-lg shadow-primary-500/20'
                      : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-md'
                    }
                  `}
                >
                  {/* Checkmark */}
                  {selectedOption === option.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-4xl flex-shrink-0">
                      {option.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-1 ${
                        selectedOption === option.id ? 'text-primary-700' : 'text-slate-900'
                      }`}>
                        {option.label}
                      </h3>
                      {option.description && (
                        <p className="text-sm text-slate-600">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              leftIcon={<ChevronLeft className="h-5 w-5" />}
              className="min-w-[120px]"
            >
              Previous
            </Button>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!selectedOption}
              rightIcon={<ChevronRight className="h-5 w-5" />}
              className="min-w-[120px]"
            >
              {currentStep === questions.length - 1 ? 'Get Results' : 'Next'}
            </Button>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-primary-600'
                    : index < currentStep
                    ? 'w-2 bg-primary-400'
                    : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span>100% Confidential</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span>Doctor Verified Results</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span>50,000+ Users Tested</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinAssessmentQuiz;