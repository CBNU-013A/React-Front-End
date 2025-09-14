import React, { useState } from "react";
import NavigationBar from "../widgets/NavigationBar";
import LocationSlider from "../widgets/LocationSlider";

const HomePage = () => {
  const [backgroundColor, setBackgroundColor] = useState("#F5F5F5");

  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-800 ease-in-out"
      style={{ backgroundColor }}
    >
      <NavigationBar />

      {/* 메인 콘텐츠 - 네비게이션바 높이만큼 상단 여백 추가 */}
      <main style={{ paddingTop: "5rem" }}>
        {/* 로케이션 슬라이더 - 전체 화면 */}
        <LocationSlider onBackgroundColorChange={handleBackgroundColorChange} />
      </main>
    </div>
  );
};

export default HomePage;
