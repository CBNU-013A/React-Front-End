import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRandomLocations } from "../services/randomLocationService";

const LocationSlider = ({ onBackgroundColorChange }) => {
  const [locations, setLocations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 랜덤 배경색 배열 (파스텔톤)
  const backgroundColors = [
    "#FFE5E5", // 연한 핑크
    "#E5F3FF", // 연한 블루
    "#F0FFF0", // 연한 민트
    "#FFF8E1", // 연한 크림
    "#F3E5F5", // 연한 라벤더
    "#E8F5E8", // 연한 그린
    "#FFF0F5", // 연한 로즈
    "#E0F2F1", // 연한 터콰이즈
    "#FDF2E9", // 연한 피치
    "#F0E6FF", // 연한 퍼플
    "#E6F3FF", // 연한 스카이블루
    "#F5F0FF", // 연한 바이올렛
    "#FFF5E6", // 연한 오렌지
    "#E8F8F5", // 연한 에메랄드
    "#F9F0FF", // 연한 라일락
  ];

  useEffect(() => {
    loadRandomLocations();
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % locations.length);
          setIsTransitioning(false);
        }, 200);
      }, 4000); // 4초마다 슬라이드 변경

      return () => clearInterval(interval);
    }
  }, [locations.length]);

  const loadRandomLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRandomLocations();

      // 사진이 있는 장소만 필터링
      const locationsWithImages = data.filter(
        (location) => location.firstimage || location.firstimage2
      );

      setLocations(locationsWithImages);
    } catch (err) {
      setError("랜덤 장소를 불러오는데 실패했습니다.");
      console.error("Error loading random locations:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (locations.length === 0) return null;
    return locations[currentIndex];
  };

  const getRandomBackgroundColor = () => {
    return backgroundColors[currentIndex % backgroundColors.length];
  };

  // 배경색이 변경될 때마다 부모 컴포넌트에 알림
  useEffect(() => {
    if (onBackgroundColorChange && locations.length > 0) {
      const currentColor = getRandomBackgroundColor();
      onBackgroundColorChange(currentColor);
    }
  }, [currentIndex, locations.length, onBackgroundColorChange]);

  if (loading) {
    return (
      <div className="location-slider">
        <div className="slider-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">여행지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || locations.length === 0) {
    return (
      <div className="location-slider">
        <div className="slider-error">
          <p className="error-text">
            {error || "사진이 있는 여행지가 없습니다."}
          </p>
          <button className="btn-primary" onClick={loadRandomLocations}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const currentLocation = getCurrentLocation();
  const backgroundColor = getRandomBackgroundColor();

  return (
    <div className="location-slider">
      <div
        className={`slider-container ${isTransitioning ? "transitioning" : ""}`}
      >
        {/* 왼쪽 텍스트 영역 */}
        <div className="slider-text-section" style={{ backgroundColor }}>
          <div className="slider-text-content">
            {/* 카테고리 라벨 */}
            <div className="slider-category">
              <span className="category-label">Pik Pick ! </span>
            </div>

            {/* 메인 제목 */}
            <h2 className="slider-main-title">{currentLocation.title}</h2>

            {/* 서브 제목 */}
            <p className="slider-subtitle">{currentLocation.addr1}</p>

            {/* 자세히 보기 링크 */}
            <Link
              to={`/location/${currentLocation._id}`}
              className="slider-link"
            >
              <span className="link-text">자세히 보기</span>
              <svg
                className="link-arrow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {/* 하단 네비게이션 */}
          <div className="slider-bottom-nav">
            {/* 프로그레스 바 */}
            <div className="slider-progress">
              <div
                className="progress-fill"
                style={{
                  width: `${((currentIndex + 1) / locations.length) * 100}%`,
                }}
              />
            </div>

            {/* 슬라이드 번호 */}
            <div className="slider-counter">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(locations.length).padStart(2, "0")}
            </div>

            {/* 네비게이션 버튼들 */}
            <div className="slider-controls">
              <button
                className="nav-btn prev"
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex((prevIndex) =>
                      prevIndex === 0 ? locations.length - 1 : prevIndex - 1
                    );
                    setIsTransitioning(false);
                  }, 200);
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button className="nav-btn pause">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6"
                  />
                </svg>
              </button>

              <button
                className="nav-btn next"
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(
                      (prevIndex) => (prevIndex + 1) % locations.length
                    );
                    setIsTransitioning(false);
                  }, 200);
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽 이미지 영역 */}
        <div className="slider-image-section">
          <img
            src={
              currentLocation.firstimage ||
              currentLocation.firstimage2 ||
              "/api/placeholder/800/600"
            }
            alt={currentLocation.title}
            className="slider-image"
          />

          {/* 이미지 오버레이 텍스트 */}
          <div className="image-overlay">
            <span className="overlay-text">{currentLocation.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSlider;
