import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import NavigationBar from "../widgets/NavigationBar";
import {
  locationService,
  recentSearchService,
} from "../services/locationService";
import useAuthStore from "../stores/authStore";

const LocationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchLocationDetail = async () => {
      try {
        setLoading(true);
        const locationData = await locationService.fetchLocation(id);
        setLocation(locationData);
      } catch (error) {
        console.error("Failed to fetch location detail:", error);
        setError("장소 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLocationDetail();
    }
  }, [id]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAddToFavorites = () => {
    // TODO: 즐겨찾기 기능 구현
    console.log("Add to favorites:", location.title);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: location.title,
        text: location.overview,
        url: window.location.href,
      });
    } else {
      // 클립보드에 URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 클립보드에 복사되었습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
        <NavigationBar />
        <main style={{ paddingTop: "5rem" }}>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="location-detail-container">
              <div className="location-detail-loading">
                <div className="location-detail-spinner"></div>
                <p>장소 정보를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
        <NavigationBar />
        <main style={{ paddingTop: "5rem" }}>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="location-detail-container">
              <div className="location-detail-error">
                <div className="location-detail-error-icon">
                  <svg
                    className="w-16 h-16 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="location-detail-error-title">
                  장소를 찾을 수 없습니다
                </h2>
                <p className="location-detail-error-text">
                  {error || "요청하신 장소 정보를 찾을 수 없습니다."}
                </p>
                <button
                  onClick={handleBackClick}
                  className="location-detail-back-btn"
                >
                  이전 페이지로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <NavigationBar />

      <main
        style={{
          paddingTop: "5rem",
          paddingBottom: "5rem",
        }}
      >
        <div className="container mx-auto px-4 py-8 max-w-full">
          <div className="location-detail-container">
            {/* 장소 헤더 */}
            <div className="location-detail-header">
              {/* 장소 이름 */}
              <h1 className="location-detail-title">{location.title}</h1>

              {/* 주소 */}
              {location.addr1 && (
                <div className="location-detail-address">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{location.addr1}</span>
                </div>
              )}

              {/* 사진 (이미지가 있는 경우만 표시) */}
              {location.firstimage && (
                <div className="location-detail-image">
                  <img
                    src={location.firstimage}
                    alt={location.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 카테고리 태그 */}
              {(location.cat1 || location.cat2) && (
                <div className="location-detail-tags">
                  {location.cat1 && (
                    <span className="location-detail-tag">{location.cat1}</span>
                  )}
                  {location.cat2 && (
                    <span className="location-detail-tag">{location.cat2}</span>
                  )}
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className="location-detail-actions">
                <button
                  onClick={handleAddToFavorites}
                  className="location-detail-action-btn location-detail-favorite-btn"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  즐겨찾기
                </button>

                <button
                  onClick={handleShare}
                  className="location-detail-action-btn location-detail-share-btn"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  공유
                </button>
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="location-detail-tabs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`location-detail-tab ${
                  activeTab === "overview" ? "active" : ""
                }`}
              >
                개요
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={`location-detail-tab ${
                  activeTab === "info" ? "active" : ""
                }`}
              >
                상세정보
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`location-detail-tab ${
                  activeTab === "reviews" ? "active" : ""
                }`}
              >
                리뷰
              </button>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="location-detail-content">
              {activeTab === "overview" && (
                <div className="location-detail-overview">
                  <h3 className="location-detail-content-title">개요</h3>
                  {location.overview ? (
                    <p className="location-detail-overview-text">
                      {location.overview}
                    </p>
                  ) : (
                    <p className="location-detail-no-content">
                      개요 정보가 없습니다.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "info" && (
                <div className="location-detail-info-tab">
                  <h3 className="location-detail-content-title">상세정보</h3>
                  <div className="location-detail-info-grid">
                    {location.addr1 && (
                      <div className="location-detail-info-item">
                        <span className="location-detail-info-label">주소</span>
                        <span className="location-detail-info-value">
                          {location.addr1}
                        </span>
                      </div>
                    )}
                    {location.cat1 && (
                      <div className="location-detail-info-item">
                        <span className="location-detail-info-label">
                          카테고리
                        </span>
                        <span className="location-detail-info-value">
                          {location.cat1}
                        </span>
                      </div>
                    )}
                    {location.cat2 && (
                      <div className="location-detail-info-item">
                        <span className="location-detail-info-label">
                          세부 카테고리
                        </span>
                        <span className="location-detail-info-value">
                          {location.cat2}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="location-detail-reviews">
                  <h3 className="location-detail-content-title">리뷰</h3>
                  <div className="location-detail-no-content">
                    <p>리뷰 기능은 준비 중입니다.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LocationDetailPage;
