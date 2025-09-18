import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import LikeButton from "../components/LikeButton";
import ReviewSection from "../components/ReviewSection";
import { locationService } from "../services/locationService";
import useAuthStore from "../stores/authStore";
import useLikeStore from "../stores/likeStore";

const LocationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sentimentFieldsData, setSentimentFieldsData] = useState(null);
  const [sentimentFieldsLoading, setSentimentFieldsLoading] = useState(false);
  const [sentimentFieldsError, setSentimentFieldsError] = useState(null);

  const { isAuthenticated } = useAuthStore();
  const { loadLikedPlaces } = useLikeStore();

  useEffect(() => {
    const fetchLocationDetail = async () => {
      try {
        setLoading(true);
        const locationData = await locationService.fetchLocation(id);
        setLocation(locationData);
      } catch (error) {
        console.error("Failed to fetch location detail:", error);
        console.error("Error details:", error.message);
        setError(`장소 정보를 불러오는데 실패했습니다. (${error.message})`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLocationDetail();
    }
  }, [id]);

  // 좋아요 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadLikedPlaces();
    }
  }, [isAuthenticated, loadLikedPlaces]);

  // 필드별 감정 분석 데이터 불러오기 (이미 로드된 location 데이터 활용)
  const fetchSentimentFieldsData = async () => {
    if (!location) return;

    try {
      setSentimentFieldsLoading(true);
      setSentimentFieldsError(null);

      // location 데이터에 aggregatedAnalysis가 있으면 사용, 없으면 API 호출
      if (
        location.aggregatedAnalysis &&
        location.aggregatedAnalysis.sentimentAspects
      ) {
        setSentimentFieldsData(location);
      } else {
        const result = await locationService.fetchLocationSentimentFields(id);
        if (result) {
          setSentimentFieldsData(result);
        } else {
          setSentimentFieldsError(
            "이 장소에는 필드별 감정 분석 데이터가 없습니다."
          );
        }
      }
    } catch (error) {
      console.error("필드별 감정 분석 데이터 불러오기 실패:", error);
      setSentimentFieldsError(
        "필드별 감정 분석 데이터를 불러오는데 실패했습니다."
      );
    } finally {
      setSentimentFieldsLoading(false);
    }
  };

  // 분석 탭이 활성화될 때 필드별 감정 분석 데이터 불러오기
  useEffect(() => {
    if (activeTab === "analysis" && location) {
      if (!sentimentFieldsData && !sentimentFieldsLoading) {
        fetchSentimentFieldsData();
      }
    }
  }, [activeTab, location, sentimentFieldsData, sentimentFieldsLoading]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: location.title,
        text: `${location.title} - 여행 정보`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 클립보드에 복사되었습니다.");
    }
  };

  // 홈페이지 URL에서 HTML 태그 제거하고 실제 URL 추출
  const extractHomepageUrl = (homepageData) => {
    if (!homepageData) return null;

    // HTML 태그가 포함된 경우 href 속성에서 URL 추출
    const hrefMatch = homepageData.match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      return hrefMatch[1];
    }

    // 일반 URL인 경우 그대로 반환
    return homepageData;
  };

  // 홈페이지 표시용 텍스트 생성
  const getHomepageDisplayText = (homepageData) => {
    if (!homepageData) return null;

    // HTML 태그가 포함된 경우 href 속성에서 URL 추출
    const hrefMatch = homepageData.match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      return hrefMatch[1];
    }

    // 일반 URL인 경우 그대로 반환
    return homepageData;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "white" }}>
        <main>
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
      <div className="min-h-screen" style={{ backgroundColor: "white" }}>
        <main>
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
                  뒤로가기
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "white" }}>
      <main>
        <div className="container mx-auto px-4 py-8 max-w-full">
          <div className="location-detail-container">
            {/* 뒤로가기, 제목, 액션 버튼들 */}
            <div className="location-detail-title-section">
              <div className="flex items-center mb-4">
                {/* 왼쪽: 뒤로가기 버튼 */}
                <div className="flex-shrink-0">
                  <button
                    onClick={handleBackClick}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    뒤로가기
                  </button>
                </div>

                {/* 가운데: 제목 */}
                <div className="flex-1 flex justify-center">
                  <h1 className="location-detail-title text-center">
                    {location.title}
                  </h1>
                </div>

                {/* 오른쪽: 액션 버튼들 */}
                <div className="flex-shrink-0 location-detail-title-actions flex items-center gap-3">
                  <LikeButton
                    placeId={location._id}
                    placeName={location.title}
                    showCount={true}
                    size="medium"
                  />
                  <button
                    onClick={handleShare}
                    className="location-detail-share-btn-small"
                    title="공유하기"
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
                  </button>
                </div>
              </div>
            </div>

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
              onClick={() => setActiveTab("analysis")}
              className={`location-detail-tab ${
                activeTab === "analysis" ? "active" : ""
              }`}
            >
              분석
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`location-detail-tab ${
                activeTab === "reviews" ? "active" : ""
              }`}
            >
              리뷰
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`location-detail-tab ${
                activeTab === "info" ? "active" : ""
              }`}
            >
              상세정보
            </button>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="location-detail-content">
            {activeTab === "overview" && (
              <div className="location-detail-overview">
                {/* LLM 요약 섹션 */}
                {location.llmoverview && (
                  <div className="llm-overview-section">
                    <div className="llm-overview-header">
                      <h3 className="location-detail-content-title">
                        <span className="llm-icon">🤖</span>
                        AI 요약
                      </h3>
                      <div className="llm-badge">LLM</div>
                    </div>
                    <div className="llm-overview-content">
                      <p className="llm-overview-text">
                        {location.llmoverview}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analysis" && (
              <div className="location-detail-analysis-tab">
                {/* 필드별 감정 분석 섹션 */}
                <div className="mt-8">
                  <h3 className="location-detail-content-title mb-6">
                    필드별 감정 분석
                  </h3>

                  {(() => {
                    // 로딩 중
                    if (sentimentFieldsLoading) {
                      return (
                        <div className="location-detail-no-keywords">
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <p className="text-gray-500 text-center">
                            필드별 감정 분석 데이터를 불러오는 중입니다...
                          </p>
                        </div>
                      );
                    }

                    // 에러 발생
                    if (sentimentFieldsError) {
                      return (
                        <div className="location-detail-no-keywords">
                          <svg
                            className="w-12 h-12 text-red-400 mx-auto mb-4"
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
                          <p className="text-red-500 text-center mb-4">
                            {sentimentFieldsError}
                          </p>
                          <button
                            onClick={fetchSentimentFieldsData}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            다시 시도
                          </button>
                        </div>
                      );
                    }

                    // 데이터 없음
                    if (
                      !sentimentFieldsData ||
                      !sentimentFieldsData.aggregatedAnalysis ||
                      !sentimentFieldsData.aggregatedAnalysis.sentimentAspects
                    ) {
                      return (
                        <div className="location-detail-no-keywords">
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                          <p className="text-gray-500 text-center">
                            필드별 감정 분석 데이터가 없습니다.
                          </p>
                        </div>
                      );
                    }

                    const sentimentAspects =
                      sentimentFieldsData.aggregatedAnalysis.sentimentAspects;
                    const fields = Object.keys(sentimentAspects);

                    return (
                      <div className="location-detail-fields-grid">
                        {fields.map((field, index) => {
                          const fieldData = sentimentAspects[field];
                          const positive = fieldData.pos || 0;
                          const negative = fieldData.neg || 0;
                          const neutral = fieldData.none || 0;
                          const total = positive + negative + neutral;

                          const positivePercentage =
                            total > 0 ? (positive / total) * 100 : 0;
                          const negativePercentage =
                            total > 0 ? (negative / total) * 100 : 0;
                          const neutralPercentage =
                            total > 0 ? (neutral / total) * 100 : 0;

                          return (
                            <div
                              key={index}
                              className="location-detail-field-card"
                            >
                              <div className="location-detail-field-header">
                                <h4 className="location-detail-field-title">
                                  {field}
                                </h4>
                              </div>

                              <div className="location-detail-field-stats">
                                <div className="location-detail-field-stat">
                                  <div className="location-detail-field-stat-header">
                                    <span className="location-detail-field-stat-label positive">
                                      긍정
                                    </span>
                                    <span className="location-detail-field-stat-count">
                                      {positivePercentage.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="location-detail-field-progress">
                                    <div
                                      className="location-detail-field-progress-bar positive"
                                      style={{
                                        width: `${positivePercentage}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                <div className="location-detail-field-stat">
                                  <div className="location-detail-field-stat-header">
                                    <span className="location-detail-field-stat-label neutral">
                                      중립
                                    </span>
                                    <span className="location-detail-field-stat-count">
                                      {neutralPercentage.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="location-detail-field-progress">
                                    <div
                                      className="location-detail-field-progress-bar neutral"
                                      style={{ width: `${neutralPercentage}%` }}
                                    ></div>
                                  </div>
                                </div>

                                <div className="location-detail-field-stat">
                                  <div className="location-detail-field-stat-header">
                                    <span className="location-detail-field-stat-label negative">
                                      부정
                                    </span>
                                    <span className="location-detail-field-stat-count">
                                      {negativePercentage.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="location-detail-field-progress">
                                    <div
                                      className="location-detail-field-progress-bar negative"
                                      style={{
                                        width: `${negativePercentage}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="location-detail-reviews-tab">
                <ReviewSection
                  locationId={location._id}
                  locationName={location.title}
                />
              </div>
            )}

            {activeTab === "info" && (
              <div className="location-detail-info-tab">
                {/* 장소 설명 섹션 */}
                <div className="location-description-section">
                  <h3 className="location-detail-content-title">장소 설명</h3>
                  {location.overview ? (
                    <div className="location-description-content">
                      <p className="location-description-text">
                        {location.overview}
                      </p>
                    </div>
                  ) : (
                    <div className="location-description-content">
                      <p className="location-detail-no-content">
                        장소 설명이 없습니다.
                      </p>
                    </div>
                  )}
                </div>

                {/* 기본 정보 섹션 */}
                <div className="location-basic-info-section">
                  <h3 className="location-detail-content-title">기본 정보</h3>
                  <div className="location-detail-info-grid">
                    {location.addr1 && (
                      <div className="location-detail-info-item">
                        <h4 className="location-detail-info-label">주소</h4>
                        <p className="location-detail-info-value">
                          {location.addr1}
                        </p>
                      </div>
                    )}
                    {location.cat1 && (
                      <div className="location-detail-info-item">
                        <h4 className="location-detail-info-label">카테고리</h4>
                        <p className="location-detail-info-value">
                          {location.cat1}
                        </p>
                      </div>
                    )}
                    {location.cat2 && (
                      <div className="location-detail-info-item">
                        <h4 className="location-detail-info-label">
                          세부 카테고리
                        </h4>
                        <p className="location-detail-info-value">
                          {location.cat2}
                        </p>
                      </div>
                    )}
                    {location.tel && (
                      <div className="location-detail-info-item">
                        <h4 className="location-detail-info-label">전화번호</h4>
                        <p className="location-detail-info-value">
                          {location.tel}
                        </p>
                      </div>
                    )}
                    {location.homepage && (
                      <div className="location-detail-info-item">
                        <h4 className="location-detail-info-label">홈페이지</h4>
                        <a
                          href={extractHomepageUrl(location.homepage)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="location-detail-info-link"
                        >
                          {getHomepageDisplayText(location.homepage)}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LocationDetailPage;
