import React, { useState } from "react";
import LocationSlider from "../widgets/LocationSlider";

const HomePage = () => {
  const [backgroundColor, setBackgroundColor] = useState("white");

  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-800 ease-in-out"
      style={{ backgroundColor }}
    >
      {/* 로케이션 슬라이더 - 전체 화면 */}
      <LocationSlider onBackgroundColorChange={handleBackgroundColorChange} />
    </div>
  );
};

export default HomePage;
