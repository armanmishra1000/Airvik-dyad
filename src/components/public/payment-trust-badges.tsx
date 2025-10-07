import { Lock, ShieldCheck } from "lucide-react";

export function PaymentTrustBadges() {
  return (
    <div className="space-y-3 py-4 px-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 text-sm">
        <Lock className="h-4 w-4 text-green-600" />
        <span className="font-medium text-gray-900">Secure SSL Encryption</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        <span>Your payment information is safe and secure</span>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">We accept:</p>
        <div className="flex items-center gap-3">
          {/* Payment method icons - using text for now, can be replaced with actual SVG logos */}
          <div className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700">
            VISA
          </div>
          <div className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700">
            MC
          </div>
          <div className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700">
            AMEX
          </div>
          <div className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700">
            UPI
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-xs text-gray-600">No hidden fees guaranteed</span>
      </div>
    </div>
  );
}
