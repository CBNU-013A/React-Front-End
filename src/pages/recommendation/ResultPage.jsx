import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import recommendationService from "../../services/recommendationService";
import sentimentService from "../../services/sentimentService";

const ResultPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [naturalLanguageText, setNaturalLanguageText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchRecommendations();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchRecommendations]);

  const fetchRecommendations = useCallback(async () => {
    try {
      setError(null);
      console.log("=== ResultPage에서 추천 결과 조회 시작 ===");
      console.log("사용자 정보:", user);
      console.log("토큰:", token);

      if (!user || !user._id) {
        console.error("사용자 정보가 없습니다");
        setError("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        return;
      }

      if (!token) {
        console.error("토큰이 없습니다");
        setError("인증 토큰이 없습니다. 다시 로그인해주세요.");
        return;
      }

      const recommendationsData =
        await recommendationService.getRecommendations(user._id, token);

      console.log("받은 추천 데이터:", recommendationsData);
      console.log("추천 데이터 길이:", recommendationsData?.length || 0);

      setRecommendations(recommendationsData || []);

      // 데이터 로드 후 자동 슬라이드 시작
      if (recommendationsData && recommendationsData.length > 0) {
        startAutoSlide();
      } else {
        console.log("추천 데이터가 비어있습니다");
        setError("추천 결과가 없습니다. 다른 선택으로 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("추천 결과 조회 오류:", error);
      setError(
        "추천 결과를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  }, [user, token, startAutoSlide]);

  const startAutoSlide = useCallback(() => {
    if (recommendations.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(
          (prevIndex) => (prevIndex + 1) % recommendations.length
        );
      }, 2000); // 2초마다 슬라이드
    }
  }, [recommendations.length]);

  const stopAutoSlide = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAnalyzeSentiment = async () => {
    if (!naturalLanguageText.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await sentimentService.analyzeSentiment(
        naturalLanguageText
      );
      console.log("감성 분석 결과:", result);
    } catch (error) {
      console.error("감성 분석 오류:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLocationClick = (locationId, locationName) => {
    navigate(`/location/${locationId}`, {
      state: { locationName },
    });
  };

  const handleBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="recommendation-page">
        <div className="loading-container">
          <div className="loading-spinner">추천 결과를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendation-page">
        <div className="recommendation-header">
          <h1>추천 결과</h1>
          <button className="back-btn" onClick={handleBack}>
            돌아가기
          </button>
        </div>
        <div className="recommendation-content">
          <div className="error-container">
            <div className="error-message">
              <h3 style={{ color: "#EF4444", marginBottom: "1rem" }}>
                문제가 발생했습니다
              </h3>
              <p style={{ color: "#6B7280", marginBottom: "2rem" }}>{error}</p>
              <button
                className="retry-btn"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetchRecommendations();
                }}
                style={{
                  backgroundColor: "#64AB85",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "1rem 2rem",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-page">
      <div className="recommendation-header">
        <h1>추천 결과</h1>
        <button className="back-btn" onClick={handleBack}>
          돌아가기
        </button>
      </div>

      <div className="recommendation-content">
        {/* 자연어 입력 섹션 */}
        <div className="natural-language-section">
          <h3>자연어 입력 (예: 여름에 할머니랑 산책하기 좋아요)</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="문장을 입력하세요"
              value={naturalLanguageText}
              onChange={(e) => setNaturalLanguageText(e.target.value)}
              className="natural-language-input"
            />
            <button
              className="analyze-btn"
              onClick={handleAnalyzeSentiment}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "분석 중..." : "분석"}
            </button>
          </div>
        </div>

        {/* 추천 결과 섹션 */}
        <div className="recommendations-section">
          {recommendations.length === 0 ? (
            <div className="no-recommendations">
              <p>추천 장소가 없습니다</p>
            </div>
          ) : (
            <>
              {/* 페이지 인디케이터 */}
              <div className="page-indicators">
                {recommendations.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${
                      currentIndex === index ? "active" : ""
                    }`}
                  />
                ))}
              </div>

              {/* 추천 카드 */}
              <div
                className="recommendation-card"
                onClick={() =>
                  handleLocationClick(
                    recommendations[currentIndex]?.id,
                    recommendations[currentIndex]?.title
                  )
                }
                onMouseEnter={stopAutoSlide}
                onMouseLeave={startAutoSlide}
              >
                <div className="card-image">
                  {recommendations[currentIndex]?.image ? (
                    <img
                      src={recommendations[currentIndex].image}
                      alt={recommendations[currentIndex].title}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="image-placeholder"
                    style={{
                      display: recommendations[currentIndex]?.image
                        ? "none"
                        : "flex",
                    }}
                  >
                    <span>📍</span>
                  </div>
                </div>

                <div className="card-content">
                  <h3>
                    {recommendations[currentIndex]?.title || "장소명 없음"}
                  </h3>

                  <div className="card-scores">
                    <span className="similarity-score">
                      유사도:{" "}
                      {recommendations[currentIndex]?.similarity || "N/A"}
                    </span>
                    <span className="final-score">
                      점수: {recommendations[currentIndex]?.finalScore || "N/A"}
                    </span>
                    {recommendations[currentIndex]?.negPenalty && (
                      <span className="neg-penalty">
                        부정감성:{" "}
                        {(
                          recommendations[currentIndex].negPenalty * 100
                        ).toFixed(1)}
                        %
                      </span>
                    )}
                  </div>

                  <div className="card-footer">
                    <span className="tap-hint">탭하여 자세히 보기</span>
                    <span>→</span>
                  </div>
                </div>
              </div>

              {/* 네비게이션 버튼 */}
              <div className="navigation-buttons">
                <button
                  className="nav-btn prev-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) =>
                      prev === 0 ? recommendations.length - 1 : prev - 1
                    );
                  }}
                >
                  이전
                </button>
                <button
                  className="nav-btn next-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) =>
                      prev === recommendations.length - 1 ? 0 : prev + 1
                    );
                  }}
                >
                  다음
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
