import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import NavigationBar from "../widgets/NavigationBar";
import LikeButton from "../components/LikeButton";
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
        setError("장소 정보를 불러오는데 실패했습니다.");
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

  const handleBackClick = () => {
    navigate(-1);
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
              {/* 장소 이름과 액션 버튼들 */}
              <div className="location-detail-title-section">
                <h1 className="location-detail-title">{location.title}</h1>
                <div className="location-detail-title-actions">
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
                  <h3 className="location-detail-content-title">장소 설명</h3>
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

              {activeTab === "analysis" && (
                <div className="location-detail-analysis-tab">
                  <h3 className="location-detail-content-title">
                    키워드별 감정 분석
                  </h3>
                  <div className="location-detail-keywords-container">
                    {(() => {
                      // 안전한 데이터 접근
                      if (!location || !location.aggregatedAnalysis) {
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
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            <p className="text-gray-500 text-center">
                              분석 데이터를 불러오는 중입니다...
                            </p>
                          </div>
                        );
                      }

                      // 실제 데이터 구조: location.aggregatedAnalysis.sentiments
                      const sentiments =
                        location.aggregatedAnalysis?.sentiments || {};

                      // 키워드 ID와 이름 매핑
                      const keywordNames = {
                        "6835e145a853cdd2f586acc0": "시설관리",
                        "6835e145a853cdd2f586acbe": "화장실",
                        "6835e145a853cdd2f586acbf": "활동",
                        "6835e145a853cdd2f586acbd": "주차",
                        "6835e145a853cdd2f586acc1": "혼잡도",
                        "6835e145a853cdd2f586acc2": "접근성",
                        "6835e145a853cdd2f586acc3": "편의시설",
                        "6835e145a853cdd2f586acc4": "가성비",
                        "6835e145a853cdd2f586acc5": "아이 동반",
                        "6835e145a853cdd2f586acc6": "노약자 동반",
                        "6835e145a853cdd2f586acc7": "장소",
                        "6835e145a853cdd2f586acc8": "교통편",
                        "6835e145a853cdd2f586acc9": "청결/관리",
                        "6835e145a853cdd2f586acca": "가격",
                      };

                      // sentiments 객체를 배열로 변환 (키워드 ID와 감정 데이터)
                      const keywords = Object.entries(sentiments).map(
                        ([keywordId, sentimentData]) => ({
                          _id: keywordId,
                          name:
                            keywordNames[keywordId] ||
                            `키워드_${keywordId.slice(-4)}`, // 실제 이름 또는 임시 이름
                          sentiment: sentimentData,
                        })
                      );

                      // 디버깅을 위한 콘솔 로그
                      console.log("=== 분석 탭 디버깅 ===");
                      console.log("Location 전체:", location);
                      console.log(
                        "AggregatedAnalysis:",
                        location.aggregatedAnalysis
                      );
                      console.log("Sentiments:", sentiments);
                      console.log("Sentiments keys:", Object.keys(sentiments));
                      console.log("Keyword names mapping:", keywordNames);
                      console.log("Keywords (변환된 배열):", keywords);
                      console.log("Keywords length:", keywords?.length);
                      console.log("Keywords isArray:", Array.isArray(keywords));

                      // 각 키워드별 상세 정보 출력
                      if (keywords && keywords.length > 0) {
                        console.log("=== 각 키워드별 상세 정보 ===");
                        keywords.forEach((keyword, idx) => {
                          console.log(`키워드 ${idx}:`, {
                            id: keyword._id,
                            name: keyword.name,
                            sentiment: keyword.sentiment,
                            pos: keyword.sentiment?.pos || 0,
                            neg: keyword.sentiment?.neg || 0,
                            total:
                              (keyword.sentiment?.pos || 0) +
                              (keyword.sentiment?.neg || 0),
                          });
                        });
                      }

                      if (!keywords || keywords.length === 0) {
                        return (
                          <div className="location-detail-no-keywords">
                            <p>키워드 분석 데이터가 없습니다.</p>
                          </div>
                        );
                      }

                      // 키워드를 총 감정 수로 정렬 (Flutter 코드와 동일)
                      // keywords가 배열인지 확인하고 안전하게 처리
                      const keywordsArray = Array.isArray(keywords)
                        ? keywords
                        : [];
                      const sortedKeywords = keywordsArray
                        .filter(
                          (keyword) => keyword && typeof keyword === "object"
                        )
                        .sort((a, b) => {
                          // pos + neg의 합으로 정렬 (중립 제외)
                          const aPos = a.sentiment?.pos || 0;
                          const aNeg = a.sentiment?.neg || 0;
                          const aTotal = aPos + aNeg;

                          const bPos = b.sentiment?.pos || 0;
                          const bNeg = b.sentiment?.neg || 0;
                          const bTotal = bPos + bNeg;

                          return bTotal - aTotal;
                        });

                      console.log("정렬된 키워드 개수:", sortedKeywords.length);

                      return sortedKeywords
                        .map((keyword, index) => {
                          // 안전한 키워드 데이터 접근
                          if (!keyword || typeof keyword !== "object") {
                            console.log(
                              `키워드 ${index}: 유효하지 않은 데이터`,
                              keyword
                            );
                            return null;
                          }

                          // Flutter 코드와 동일한 구조 사용
                          const name = keyword.name || "알 수 없음";
                          const sentiment = keyword.sentiment || {};
                          const pos = sentiment.pos || 0;
                          const neg = sentiment.neg || 0;
                          const total = pos + neg; // pos + neg만 사용 (중립 제외)

                          console.log(`=== 키워드 ${index}: ${name} ===`);
                          console.log("원본 sentiment 데이터:", sentiment);
                          console.log("추출된 값들:", { pos, neg });
                          console.log("계산된 total:", total);
                          console.log("계산된 비율:", {
                            posPercent: ((pos / total) * 100).toFixed(1),
                            negPercent: ((neg / total) * 100).toFixed(1),
                          });

                          if (total === 0) {
                            console.log(
                              `키워드 ${index}: 총합이 0이므로 제외`,
                              name
                            );
                            return null;
                          }

                          const posPercent = ((pos / total) * 100).toFixed(1);
                          const negPercent = ((neg / total) * 100).toFixed(1);

                          return (
                            <div
                              key={keyword._id || index}
                              className="location-detail-keyword-item"
                            >
                              <div className="location-detail-keyword-header">
                                <h4 className="location-detail-keyword-name">
                                  {name}
                                </h4>
                              </div>

                              <div className="location-detail-keyword-analysis">
                                <div className="location-detail-keyword-percentages">
                                  <span className="location-detail-keyword-percentage negative">
                                    부정 {negPercent}% ({neg}개)
                                  </span>
                                  <span className="location-detail-keyword-percentage positive">
                                    긍정 {posPercent}% ({pos}개)
                                  </span>
                                </div>

                                <div className="location-detail-keyword-bar">
                                  <div
                                    className="location-detail-keyword-segment negative"
                                    style={{ width: `${negPercent}%` }}
                                  ></div>
                                  <div
                                    className="location-detail-keyword-segment positive"
                                    style={{ width: `${posPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                        .filter(Boolean);
                    })()}
                  </div>
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
                    {location.tel && (
                      <div className="location-detail-info-item">
                        <span className="location-detail-info-label">
                          <svg
                            className="w-4 h-4 inline mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          전화번호
                        </span>
                        <span className="location-detail-info-value">
                          <a
                            href={`tel:${location.tel}`}
                            className="location-detail-info-link"
                          >
                            {location.tel}
                          </a>
                        </span>
                      </div>
                    )}
                    {location.homepage && (
                      <div className="location-detail-info-item">
                        <span className="location-detail-info-label">
                          홈페이지
                        </span>
                        <span className="location-detail-info-value">
                          <a
                            href={(() => {
                              // HTML 태그에서 URL 추출
                              const match =
                                location.homepage.match(/href="([^"]*)"/);
                              return match ? match[1] : location.homepage;
                            })()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="location-detail-info-link"
                          >
                            {(() => {
                              // HTML 태그에서 URL 추출하여 표시
                              const match =
                                location.homepage.match(/href="([^"]*)"/);
                              if (match) {
                                const url = match[1];
                                // URL에서 도메인 부분만 표시
                                try {
                                  const urlObj = new URL(url);
                                  return urlObj.hostname;
                                } catch {
                                  return url;
                                }
                              }
                              return location.homepage;
                            })()}
                          </a>
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
