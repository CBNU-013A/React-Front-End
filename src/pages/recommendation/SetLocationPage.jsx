import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  RECOMMENDATION_OPTIONS,
  AVAILABLE_CITIES,
} from "../../constants/recommendationOptions";
import recommendationService from "../../services/recommendationService";
import locationService from "../../services/locationService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

const SetLocationPage = () => {
  const navigate = useNavigate();
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedAccompany, setSelectedAccompany] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedConveniences, setSelectedConveniences] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: 도시, 2: 동행, 3: 계절, 4: 장소, 5: 활동, 6: 편의시설

  // 실시간 추천 결과를 위한 상태
  const [liveRecommendations, setLiveRecommendations] = useState([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState(null);

  // 장소 상세 정보를 위한 상태
  const [locationDetails, setLocationDetails] = useState({});
  const [loadingLocations, setLoadingLocations] = useState(new Set());

  const totalSteps = 6;

  // 장소 상세 정보 가져오기 함수
  const fetchLocationDetails = useCallback(
    async (locationId) => {
      if (locationDetails[locationId] || loadingLocations.has(locationId)) {
        return; // 이미 로딩 중이거나 데이터가 있으면 스킵
      }

      setLoadingLocations((prev) => new Set(prev).add(locationId));

      try {
        console.log("장소 상세 정보 가져오기:", locationId);
        const locationData = await locationService.fetchLocation(locationId);

        setLocationDetails((prev) => ({
          ...prev,
          [locationId]: locationData,
        }));
      } catch (error) {
        console.error("장소 상세 정보 가져오기 실패:", error);
      } finally {
        setLoadingLocations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(locationId);
          return newSet;
        });
      }
    },
    [locationDetails, loadingLocations]
  );

  // 실시간 추천 요청 함수
  const fetchLiveRecommendations = useCallback(async () => {
    // 최소한의 선택사항이 있을 때만 요청
    if (selectedCities.length === 0) {
      setLiveRecommendations([]);
      return;
    }

    setIsLoadingLive(true);
    setLiveError(null);

    try {
      const userSelections = {
        city: selectedCities,
        accompany: selectedAccompany,
        season: selectedSeason,
        place: selectedPlace,
        activity: selectedActivity,
        conveniences: selectedConveniences,
      };

      console.log("실시간 추천 요청:", userSelections);

      // 먼저 새로운 추천 요청을 시도
      let result =
        await recommendationService.getRecommendationsByUserSelection(
          localStorage.getItem("userId"),
          localStorage.getItem("token"),
          userSelections
        );

      // 실패하면 히스토리 조회로 fallback
      if (!result.success) {
        result = await recommendationService.getRecommendationHistory(
          localStorage.getItem("userId"),
          localStorage.getItem("token")
        );
      }

      if (result.success) {
        const recommendations = result.data.recommendations || [];
        setLiveRecommendations(recommendations.slice(0, 6)); // 최대 6개만 표시
        console.log("실시간 추천 결과:", recommendations.length, "개");

        // 추천된 장소들의 상세 정보 가져오기
        recommendations.slice(0, 6).forEach((rec) => {
          if (rec.id) {
            fetchLocationDetails(rec.id);
          }
        });
      } else {
        setLiveError("추천 결과를 불러올 수 없습니다.");
        setLiveRecommendations([]);
      }
    } catch (error) {
      console.error("실시간 추천 오류:", error);
      setLiveError("추천 요청 중 오류가 발생했습니다.");
      setLiveRecommendations([]);
    } finally {
      setIsLoadingLive(false);
    }
  }, [
    selectedCities,
    selectedAccompany,
    selectedSeason,
    selectedPlace,
    selectedActivity,
    selectedConveniences,
    fetchLocationDetails,
  ]);

  // 선택사항이 변경될 때마다 실시간 추천 요청 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLiveRecommendations();
    }, 1000); // 1초 후에 요청

    return () => clearTimeout(timer);
  }, [fetchLiveRecommendations]);

  const handleCitySelect = (city) => {
    setSelectedCities((prev) => {
      const isSelected = prev.includes(city);
      if (isSelected) {
        return prev.filter((selectedCity) => selectedCity !== city);
      } else {
        if (prev.length < 3) {
          return [...prev, city];
        } else {
          alert("최대 3개까지만 선택할 수 있습니다.");
          return prev;
        }
      }
    });
  };

  const handleAccompanySelect = (accompanyId) => {
    setSelectedAccompany(accompanyId);
  };

  const handleSeasonSelect = (seasonId) => {
    setSelectedSeason(seasonId);
  };

  const handlePlaceSelect = (placeId) => {
    setSelectedPlace(placeId);
  };

  const handleActivitySelect = (activityId) => {
    setSelectedActivity(activityId);
  };

  const handleConvenienceSelect = (convenienceId) => {
    setSelectedConveniences((prev) => {
      const isSelected = prev.includes(convenienceId);
      if (isSelected) {
        return prev.filter((id) => id !== convenienceId);
      } else {
        return [...prev, convenienceId];
      }
    });
  };

  // 사용자 선택을 API로 전송하여 추천 결과 받기
  const getRecommendations = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("로그인이 필요합니다. (userId 없음)");
        return null;
      }

      console.log("추천 요청 시작");

      // 모든 선택사항을 하나의 payload로 구성
      const userSelections = {
        city: selectedCities,
        accompany: selectedAccompany,
        season: selectedSeason,
        place: selectedPlace,
        activity: selectedActivity,
        conveniences: selectedConveniences,
      };

      console.log("추천 요청 사용자 선택사항:", userSelections);

      // 먼저 새로운 추천 요청을 보내고, 실패하면 히스토리 조회
      let result =
        await recommendationService.getRecommendationsByUserSelection(
          userId,
          token,
          userSelections
        );

      // 새로운 추천 요청이 실패하면 히스토리 조회
      if (!result.success) {
        console.log("새로운 추천 요청 실패, 히스토리 조회로 fallback");
        result = await recommendationService.getRecommendationHistory(
          userId,
          token
        );
      }

      if (result.success) {
        console.log("추천 결과:", result.data);
        console.log(
          "추천 결과 개수:",
          result.data.recommendations?.length || 0
        );
        return result;
      } else {
        console.error("추천 요청 실패:", result.error);
        console.error("응답 상태:", result.status);
        alert(
          `추천 요청에 실패했습니다: ${result.error}\n상태: ${
            result.status || "Unknown"
          }`
        );
        return null;
      }
    } catch (e) {
      console.error("추천 요청 오류:", e);
      alert("서버 통신 중 오류가 발생했습니다.");
      return null;
    }
  };

  const handleNext = async () => {
    // 현재 단계별 유효성 검사
    if (currentStep === 1 && selectedCities.length === 0) {
      alert("최소 1개 이상의 도시를 선택해주세요.");
      return;
    }
    if (currentStep === 2 && !selectedAccompany) {
      alert("동행을 선택해주세요.");
      return;
    }
    if (currentStep === 3 && !selectedSeason) {
      alert("계절을 선택해주세요.");
      return;
    }
    if (currentStep === 4 && !selectedPlace) {
      alert("장소 유형을 선택해주세요.");
      return;
    }
    if (currentStep === 5 && !selectedActivity) {
      alert("활동을 선택해주세요.");
      return;
    }

    // 마지막 단계인 경우 추천 요청
    if (currentStep === totalSteps) {
      const result = await getRecommendations();
      if (result) {
        // 선택된 도시들을 localStorage에 저장 (UI 복원용)
        localStorage.setItem("selectedCities", JSON.stringify(selectedCities));
        // 추천 결과를 localStorage에 저장
        localStorage.setItem("recommendationResult", JSON.stringify(result));
        navigate("/recommendation/result");
      }
    } else {
      // 다음 단계로 이동
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // 첫 번째 단계에서 뒤로가기 시 홈으로
      handleBack();
    }
  };

  const handleBack = () => {
    // 뒤로가기 시 모든 선택한 내용 초기화
    localStorage.removeItem("selectedCities");
    localStorage.removeItem("selectedWithKeywordId");
    localStorage.removeItem("selectedWithKeyword");
    localStorage.removeItem("selectedThemeKeywordId");
    localStorage.removeItem("selectedThemeKeyword");
    localStorage.removeItem("selectedActivityKeywordId");
    localStorage.removeItem("selectedActivityKeyword");
    localStorage.removeItem("selectedSeasonKeywordId");
    localStorage.removeItem("selectedSeasonKeyword");
    localStorage.removeItem("selectedFeatures");
    console.log("뒤로가기 - 모든 선택 데이터 초기화");
    navigate("/");
  };

  // 단계별 제목과 설명
  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "어떤 도시의 장소를 추천받고 싶나요?",
          description: `최대 3개까지 선택 가능합니다. (${selectedCities.length}/3)`,
        };
      case 2:
        return {
          title: "누구와 함께 가시나요?",
          description: "하나를 선택해주세요.",
        };
      case 3:
        return {
          title: "언제 가시나요?",
          description: "하나를 선택해주세요.",
        };
      case 4:
        return {
          title: "어떤 종류의 장소를 원하시나요?",
          description: "하나를 선택해주세요.",
        };
      case 5:
        return {
          title: "어떤 활동을 하고 싶으신가요?",
          description: "하나를 선택해주세요.",
        };
      case 6:
        return {
          title: "필요한 편의시설이 있나요?",
          description: "여러 개 선택 가능합니다.",
        };
      default:
        return { title: "", description: "" };
    }
  };

  // 단계별 옵션 렌더링
  const renderStepOptions = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="options-grid-web">
            {AVAILABLE_CITIES.map((city) => {
              const isSelected = selectedCities.includes(city);
              return (
                <button
                  key={city}
                  className={`option-card-web ${isSelected ? "selected" : ""}`}
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="option-content">
                    <span className="option-icon">🏙️</span>
                    <span className="option-text">{city}</span>
                  </div>
                  {isSelected && (
                    <div className="selected-indicator-web">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );
      case 2:
        return (
          <div className="options-grid-web">
            {RECOMMENDATION_OPTIONS.ACCOMPANY.filter(
              (option) => option.isActive !== false
            ).map((option) => (
              <button
                key={option.id}
                className={`option-card-web ${
                  selectedAccompany === option.id ? "selected" : ""
                }`}
                onClick={() => handleAccompanySelect(option.id)}
              >
                <div className="option-content">
                  <span className="option-icon">👥</span>
                  <span className="option-text">{option.name}</span>
                </div>
                {selectedAccompany === option.id && (
                  <div className="selected-indicator-web">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="options-grid-web">
            {RECOMMENDATION_OPTIONS.SEASON.map((option) => (
              <button
                key={option.id}
                className={`option-card-web ${
                  selectedSeason === option.id ? "selected" : ""
                }`}
                onClick={() => handleSeasonSelect(option.id)}
              >
                <div className="option-content">
                  <span className="option-icon">🌤️</span>
                  <span className="option-text">{option.name}</span>
                </div>
                {selectedSeason === option.id && (
                  <div className="selected-indicator-web">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="options-grid-web">
            {RECOMMENDATION_OPTIONS.PLACE.map((option) => (
              <button
                key={option.id}
                className={`option-card-web ${
                  selectedPlace === option.id ? "selected" : ""
                }`}
                onClick={() => handlePlaceSelect(option.id)}
              >
                <div className="option-content">
                  <span className="option-icon">🏛️</span>
                  <span className="option-text">{option.name}</span>
                </div>
                {selectedPlace === option.id && (
                  <div className="selected-indicator-web">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="options-grid-web">
            {RECOMMENDATION_OPTIONS.ACTIVITY.map((option) => (
              <button
                key={option.id}
                className={`option-card-web ${
                  selectedActivity === option.id ? "selected" : ""
                }`}
                onClick={() => handleActivitySelect(option.id)}
              >
                <div className="option-content">
                  <span className="option-icon">🎯</span>
                  <span className="option-text">{option.name}</span>
                </div>
                {selectedActivity === option.id && (
                  <div className="selected-indicator-web">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        );
      case 6:
        return (
          <div className="options-grid-web">
            {RECOMMENDATION_OPTIONS.CONVENIENCES.map((option) => (
              <button
                key={option.id}
                className={`option-card-web ${
                  selectedConveniences.includes(option.id) ? "selected" : ""
                }`}
                onClick={() => handleConvenienceSelect(option.id)}
              >
                <div className="option-content">
                  <span className="option-icon">✨</span>
                  <span className="option-text">{option.name}</span>
                </div>
                {selectedConveniences.includes(option.id) && (
                  <div className="selected-indicator-web">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className="recommendation-page-web">
      <div className="recommendation-container-web">
        {/* 헤더 섹션 */}
        <div className="recommendation-header-web">
          <button className="back-btn-web" onClick={handlePrev}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {currentStep === 1 ? "돌아가기" : "이전"}
          </button>

          <div className="header-content">
            <h1 className="page-title">추천 받기</h1>
            <p className="page-subtitle">
              당신에게 맞는 완벽한 장소를 찾아드릴게요
            </p>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="recommendation-main-web">
          {/* 왼쪽: 진행률 및 정보 */}
          <div className="progress-sidebar">
            <div className="progress-card">
              <div className="progress-header">
                <h3>진행 상황</h3>
                <span className="step-counter">
                  {currentStep} / {totalSteps}
                </span>
              </div>

              <div className="progress-bar-web">
                <div
                  className="progress-fill-web"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>

              <div className="step-list">
                {[
                  { step: 1, title: "도시 선택", icon: "🏙️" },
                  { step: 2, title: "동행 선택", icon: "👥" },
                  { step: 3, title: "계절 선택", icon: "🌤️" },
                  { step: 4, title: "장소 유형", icon: "🏛️" },
                  { step: 5, title: "활동 선택", icon: "🎯" },
                  { step: 6, title: "편의시설", icon: "✨" },
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`step-item ${
                      currentStep >= item.step ? "completed" : ""
                    } ${currentStep === item.step ? "current" : ""}`}
                  >
                    <span className="step-icon">{item.icon}</span>
                    <span className="step-title">{item.title}</span>
                    {currentStep > item.step && (
                      <span className="check-icon">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 선택 옵션 */}
          <div className="selection-main">
            <div className="selection-card">
              <div className="selection-header">
                <h2 className="selection-title">{stepInfo.title}</h2>
                <p className="selection-description">{stepInfo.description}</p>
              </div>

              <div className="selection-content">{renderStepOptions()}</div>

              <div className="selection-actions">
                <button
                  className="btn-primary-web"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && selectedCities.length === 0) ||
                    (currentStep === 2 && !selectedAccompany) ||
                    (currentStep === 3 && !selectedSeason) ||
                    (currentStep === 4 && !selectedPlace) ||
                    (currentStep === 5 && !selectedActivity)
                  }
                >
                  {currentStep === totalSteps ? (
                    <>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                      </svg>
                      추천 받기
                    </>
                  ) : (
                    <>
                      다음 단계
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 실시간 추천 결과 사이드바 */}
          {selectedCities.length > 0 && (
            <div className="live-recommendations-sidebar">
              <div className="live-recommendations-card">
                <div className="live-recommendations-header">
                  <h3 className="live-recommendations-title">
                    <span className="live-icon">⚡</span>
                    실시간 추천
                  </h3>
                  {isLoadingLive && (
                    <div className="live-loading">
                      <div className="loading-spinner"></div>
                    </div>
                  )}
                </div>

                {liveError ? (
                  <div className="live-error">
                    <p>{liveError}</p>
                  </div>
                ) : liveRecommendations.length > 0 ? (
                  <div className="live-recommendations-list">
                    {liveRecommendations.map((recommendation, index) => {
                      const locationData = locationDetails[recommendation.id];
                      const isLoading = loadingLocations.has(recommendation.id);

                      return (
                        <div
                          key={recommendation.id || index}
                          className="live-recommendation-item-detailed"
                        >
                          <div className="live-recommendation-rank">
                            #{index + 1}
                          </div>

                          <div className="live-recommendation-image">
                            {isLoading ? (
                              <div className="image-loading">
                                <div className="loading-spinner"></div>
                              </div>
                            ) : locationData?.firstimage ? (
                              <img
                                src={locationData.firstimage}
                                alt={recommendation.title}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="image-placeholder"
                              style={{
                                display: locationData?.firstimage
                                  ? "none"
                                  : "flex",
                              }}
                            >
                              <span>📷</span>
                            </div>
                          </div>

                          <div className="live-recommendation-content">
                            <h4 className="live-recommendation-title">
                              {recommendation.title}
                            </h4>
                            <p className="live-recommendation-city">
                              {recommendation.city}
                            </p>
                            {locationData?.overview && (
                              <p className="live-recommendation-overview">
                                {locationData.overview.length > 100
                                  ? `${locationData.overview.substring(
                                      0,
                                      100
                                    )}...`
                                  : locationData.overview}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="live-no-results">
                    <p>
                      선택사항을 더 추가하면 추천 결과를 확인할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetLocationPage;
