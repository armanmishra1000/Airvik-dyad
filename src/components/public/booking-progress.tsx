import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingProgressProps {
  currentStep: 1 | 2 | 3;
  className?: string;
}

export function BookingProgress({ currentStep, className }: BookingProgressProps) {
  const steps = [
    { number: 1, label: "Select Room", sublabel: "Choose your stay" },
    { number: 2, label: "Review", sublabel: "Confirm details" },
    { number: 3, label: "Confirmation", sublabel: "Booking complete" },
  ];

  return (
    <div className={cn("w-full max-w-4xl mx-auto py-8", className)}>
      <div className="relative">
        {/* Progress Line - Behind circles */}
        <div className="absolute left-[10%] right-[10%] top-6 h-[2px] bg-gray-200">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between items-start">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center flex-1">
              {/* Circle */}
              <div className="relative z-10">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-sm",
                    step.number < currentStep && "bg-primary text-white border-2 border-primary",
                    step.number === currentStep && "bg-primary text-white border-2 border-primary scale-110 shadow-lg ring-4 ring-primary/20",
                    step.number > currentStep && "bg-white border-2 border-gray-200 text-gray-400"
                  )}
                >
                  {step.number < currentStep ? (
                    <Check className="h-6 w-6" strokeWidth={3} />
                  ) : (
                    <span className="text-base font-bold">{step.number}</span>
                  )}
                </div>
              </div>
              
              {/* Labels */}
              <div className="mt-4 text-center">
                <div className={cn(
                  "text-sm font-semibold transition-colors",
                  step.number === currentStep ? "text-primary" : 
                  step.number < currentStep ? "text-gray-700" : "text-gray-400"
                )}>
                  {step.label}
                </div>
                <div className={cn(
                  "text-xs mt-1",
                  step.number <= currentStep ? "text-gray-500" : "text-gray-400"
                )}>
                  {step.sublabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
