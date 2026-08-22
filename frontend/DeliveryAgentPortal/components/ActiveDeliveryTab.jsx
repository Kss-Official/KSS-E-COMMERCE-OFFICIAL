import React, { useState } from 'react';
import { Navigation, MapPin, Phone, CheckCircle2, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';

export default function ActiveDeliveryTab() {
  const [currentStep, setCurrentStep] = useState(2); // 1: Pickup, 2: On the Way, 3: Arrived, 4: OTP Verification & Payment, 5: Complete
  const [otp, setOtp] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    { title: 'Picked up from Warehouse', desc: 'Sector 62 Central Hub' },
    { title: 'On the Way', desc: 'Navigating to Customer Address' },
    { title: 'Arrived at Destination', desc: 'Notify Customer' },
    { title: 'Payment & OTP Verification', desc: 'Collect ₹1,299 COD' },
  ];

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      if (otp.length === 4 || otp === '1234' || otp === '') {
        setIsCompleted(true);
      } else {
        alert('Please enter valid 4-digit Delivery OTP (e.g. 1234)');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Delivery Execution</h2>
        <p className="text-sm text-gray-500 font-medium">Real-time GPS tracking, customer contact, and OTP verification.</p>
      </div>

      {isCompleted ? (
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-emerald-950">Delivery Completed Successfully!</h3>
          <p className="text-sm text-emerald-800 font-medium max-w-md mx-auto">
            Order <strong>#ORD-10245</strong> has been delivered to <strong>Rahul Sharma</strong> and payment of <strong>₹1,299 COD</strong> was collected.
          </p>
          <button
            onClick={() => {
              setIsCompleted(false);
              setCurrentStep(1);
            }}
            className="mt-4 bg-[#1b4d3e] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md"
          >
            Start Next Delivery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Progress Tracker Column */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <h3 className="font-bold text-base text-gray-900">Delivery Stages</h3>

            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {steps.map((st, idx) => {
                const stepNum = idx + 1;
                const isPassed = stepNum <= currentStep;
                return (
                  <div key={idx} className="relative flex items-start space-x-3.5 z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isPassed ? 'bg-[#1b4d3e] text-white ring-4 ring-emerald-50' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {stepNum}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isPassed ? 'text-gray-900' : 'text-gray-400'}`}>{st.title}</h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Work Area */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-bold block">Current Order</span>
                <span className="text-lg font-black text-gray-900">#ORD-10245</span>
              </div>
              <a href="tel:+919876543210" className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold">
                <Phone className="w-4 h-4" />
                <span>Call Customer</span>
              </a>
            </div>

            {/* Delivery Location Info */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Customer:</span>
                <span className="font-bold text-gray-900">Rahul Sharma</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Address:</span>
                <span className="font-semibold text-gray-800">12, Green Park, Delhi - 110016</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Collect Cash (COD):</span>
                <span className="font-black text-[#ff5100] text-sm">₹1,299</span>
              </div>
            </div>

            {/* OTP Input Form at Stage 4 */}
            {currentStep === 4 && (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="font-bold text-xs">Customer OTP Verification</h4>
                </div>
                <p className="text-[11px] text-emerald-700">Ask the customer for the 4-digit verification code sent to their registered mobile number.</p>
                <input
                  type="text"
                  maxLength="4"
                  placeholder="Enter 4-digit OTP (e.g. 1234)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-emerald-300 rounded-xl font-mono text-center tracking-widest font-black focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            )}

            {/* Stage Action Control */}
            <button
              onClick={handleNextStep}
              className="w-full bg-[#ff5100] hover:bg-[#e64900] text-white py-3 rounded-xl font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{currentStep === 4 ? 'Confirm & Finish Delivery' : 'Advance to Next Stage'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
