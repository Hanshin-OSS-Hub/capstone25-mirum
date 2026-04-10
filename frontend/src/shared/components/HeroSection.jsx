// src/components/HeroSection.jsx
import React from "react";
import { Button } from "./Button";

export const HeroSection = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToDemo = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50"
      style={{
        backgroundImage:
          "url('https://readdy.ai/api/search-image?query=Modern%20university%20students%20collaborating%20on%20laptops%20in%20a%20bright%2C%20clean%20study%20space%20with%20soft%20lighting%2C%20minimalist%20design%2C%20productivity%20atmosphere%2C%20teamwork%20environment%2C%20contemporary%20workspace%20with%20natural%20light%20streaming%20through%20large%20windows%2C%20clean%20white%20and%20blue%20color%20scheme%2C%20professional%20yet%20friendly%20atmosphere&width=1920&height=1080&seq=hero1&orientation=landscape')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="absolute inset-0 bg-white/80"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              마감일까지 대책 없이
              <span className="text-indigo-600"> 미루던 일</span>,<br />
              이제는 <span className="text-indigo-600">미룸</span>에서
              <span className="text-indigo-600"> 함께 끝내자!</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              대학생을 위한 직관적이고 통합된 프로젝트 관리 도구
              <br />
              복잡한 협업 도구는 이제 그만, MIRUM으로 간편하게 시작하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="primary"
                size="lg"
                className="text-lg px-8 py-4"
                onClick={scrollToContact}
              >
                <i className="ri-rocket-line mr-2"></i>
                무료로 시작하기
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4"
                onClick={scrollToDemo}
              >
                <i className="ri-play-circle-line mr-2"></i>
                데모 보기
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <i className="ri-check-line text-green-500 mr-1"></i>
                무료 체험
              </div>
              <div className="flex items-center">
                <i className="ri-check-line text-green-500 mr-1"></i>
                신용카드 불필요
              </div>
              <div className="flex items-center">
                <i className="ri-check-line text-green-500 mr-1"></i>
                즉시 사용 가능
              </div>
            </div>
          </div>

          {/* Right Content - Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600 mb-2">98%</div>
              <div className="text-gray-600">프로젝트 완료율 향상</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600 mb-2">50%</div>
              <div className="text-gray-600">협업 시간 단축</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                10,000+
              </div>
              <div className="text-gray-600">대학생 사용자</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                4.9★
              </div>
              <div className="text-gray-600">사용자 만족도</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
