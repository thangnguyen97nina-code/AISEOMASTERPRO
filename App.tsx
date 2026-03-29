
import React, { useState, useEffect } from 'react';
import { BusinessInfo, SEOResult, AppStep } from './types';
import Header from './components/Header';
import BusinessForm from './components/BusinessForm';
import SEOContentGenerator from './components/SEOContentGenerator';
import ResultDisplay from './components/ResultDisplay';
import DonatePopup from './components/DonatePopup';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.CONFIG);
  const [usageCount, setUsageCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleGenerationStart = () => {
    setStep(AppStep.PROCESSING);
  };

  const handleGenerationComplete = () => {
    // Increment usage count and check for lock
    setUsageCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 10) { // Increased limit for PRO version
        setIsLocked(true);
      }
      return newCount;
    });
  };

  const handleUnlock = (code: string) => {
    if (code === "XLBOTF97") {
      setIsLocked(false);
      setUsageCount(0);
    }
  };

  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isLocked]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {isLocked && <DonatePopup onUnlock={handleUnlock} />}

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <SEOContentGenerator 
          step={step}
          setStep={setStep}
          onStart={handleGenerationStart}
          onComplete={handleGenerationComplete} 
        />
      </main>

      <footer className="bg-white border-t py-8 text-center text-gray-400">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold text-gray-600">© 2026 - Version 3.0 PRO</p>
          <p className="text-[12px] opacity-70 mt-2 max-w-md mx-auto">
            Hệ thống tự động hóa Content SEO chuyên sâu cho doanh nghiệp
          </p>
          <p className="text-[11px] mt-4 text-gray-300">
            QT Solutions - Bột Nguyễn - Hỗ trợ chăm sóc Website bằng AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
