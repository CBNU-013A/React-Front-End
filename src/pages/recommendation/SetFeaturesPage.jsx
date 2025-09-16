import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import recommendationService from "../../services/recommendationService";

const SetFeaturesPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [features, setFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const fetchFeatures = useCallback(async () => {
    try {
      const featuresData = await recommendationService.getFeatures(token);
      console.log("받은 편의시설 데이터:", featuresData);

      // 백엔드에서 이미 필터링된 데이터를 받으므로 추가 필터링 불필요
      setFeatures(featuresData);
    } catch (error) {
      console.error("편의시설 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const toggleFeature = (featureId) => {
    setSelectedFeatures((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        if (newSet.size < 3) {
          newSet.add(featureId);
        } else {
          alert("최대 3개까지만 선택할 수 있습니다.");
        }
      }
      return newSet;
    });
  };

  const saveSelectedFeatures = async () => {
    if (selectedFeatures.size === 0) {
      alert("최소 1개 이상의 항목을 선택해주세요.");
      return;
    }

    try {
      console.log("=== 편의시설 선택 저장 시작 ===");
      console.log("사용자 정보:", user);
      console.log("토큰:", token);
      console.log("선택된 편의시설:", selectedFeatures);

      const selectedFeaturesList = Array.from(selectedFeatures);
      console.log("편의시설 리스트:", selectedFeaturesList);

      // 1. 편의시설 선택 제출
      console.log("편의시설 선택 제출 시작...");
      const submittedFeatures = await recommendationService.submitFeatures(
        token,
        selectedFeaturesList
      );
      console.log("편의시설 제출 결과:", submittedFeatures);

      // 2. 카테고리 선호도 저장
      const withId = localStorage.getItem("selectedWithKeywordId") || "";
      const themeId = localStorage.getItem("selectedThemeKeywordId") || "";
      const activityId =
        localStorage.getItem("selectedActivityKeywordId") || "";
      const seasonId = localStorage.getItem("selectedSeasonKeywordId") || "";

      console.log("저장된 카테고리 ID들:");
      console.log("- 방문 대상:", withId);
      console.log("- 테마:", themeId);
      console.log("- 활동:", activityId);
      console.log("- 계절:", seasonId);

      const categorySelections = [withId, themeId, activityId, seasonId].filter(
        (id) => id !== ""
      );
      console.log("필터링된 카테고리 선택:", categorySelections);

      // 편의시설 ID와 카테고리 선택을 모두 포함한 선호도 배열
      const featureIds = submittedFeatures.map((f) => f._id);
      const allPreferences = [...categorySelections, ...featureIds];
      console.log("전체 선호도 배열:", allPreferences);

      console.log("사용자 선호도 저장 시작...");
      const success = await recommendationService.saveKeywordPreferences(
        user._id,
        token,
        allPreferences
      );
      console.log("사용자 선호도 저장 결과:", success);

      if (success) {
        localStorage.setItem(
          "selectedFeatures",
          JSON.stringify(selectedFeaturesList)
        );
        console.log("모든 데이터 저장 완료, 결과 페이지로 이동");
        navigate("/recommendation/result");
      } else {
        console.error("데이터 저장 실패");
        alert("선택 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("선택 저장 오류:", error);
      alert("선택 저장 중 오류가 발생했습니다.");
    }
  };

  const handleBack = () => {
    // 뒤로가기 시 모든 선택한 내용 초기화
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

  if (loading) {
    return (
      <div className="recommendation-page">
        <div className="loading-container">
          <div className="loading-spinner">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-page">
      <div className="recommendation-content">
        <div style={{ textAlign: "left", marginBottom: "2rem" }}>
          <button className="back-btn" onClick={handleBack}>
            돌아가기
          </button>
        </div>

        <div className="features-header">
          <h2>이번 여행에서 중요하게 생각하는게 있나요?</h2>
          <p>최대 3개까지 선택 가능합니다. ({selectedFeatures.size}/3)</p>
        </div>

        <div className="features-grid">
          {features.map((feature) => {
            const isSelected = selectedFeatures.has(feature._id);
            return (
              <button
                key={feature._id}
                className={`feature-btn ${isSelected ? "selected" : ""}`}
                onClick={() => toggleFeature(feature._id)}
              >
                {feature.name}
              </button>
            );
          })}
        </div>

        <div className="features-actions">
          <button
            className="features-submit-btn"
            onClick={saveSelectedFeatures}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetFeaturesPage;
