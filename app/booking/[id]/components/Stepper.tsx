'use client';

import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StepperProps {
  currentStep: number;
  steps: Step[];
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6 md:mb-8">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="flex flex-col items-center flex-1 relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 sm:top-6 left-1/2 w-full h-0.5 -z-10 transition-colors duration-300 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                  style={{ transform: 'translateY(-50%)' }}
                />
              )}

              {/* Step Circle */}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : isCurrent
                    ? 'bg-emerald-600 text-white shadow-xl ring-4 ring-emerald-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 sm:mt-3 text-center px-1">
                <p
                  className={`text-xs sm:text-sm font-semibold transition-colors ${
                    isCurrent
                      ? 'text-emerald-600'
                      : isCompleted
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{step.number}</span>
                </p>
                <p
                  className={`hidden sm:block text-xs mt-1 ${
                    isCurrent ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  Step {step.number}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
