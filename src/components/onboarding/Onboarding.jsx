import React, { useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

export default function Onboarding({ onComplete }) {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { icon: "⚡", titleKey: "onboarding.slide1_title", descKey: "onboarding.slide1_desc" },
    { icon: "🔄", titleKey: "onboarding.slide2_title", descKey: "onboarding.slide2_desc" },
    { icon: "🚀", titleKey: "onboarding.slide3_title", descKey: "onboarding.slide3_desc" },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem("turboflow_onboarding_completed", "true");
      onComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="max-w-md w-full px-6">
        <div className="text-center">
          <div className="text-6xl mb-6">{slide.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t(slide.titleKey)}</h2>
          <p className="text-gray-600 mb-8">{t(slide.descKey)}</p>

          <div className="flex gap-2 justify-center mb-6">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {currentSlide < slides.length - 1 ? t('onboarding.next') : t('onboarding.start')}
          </button>
        </div>
      </div>
    </div>
  );
}
