const API_BASE_URL = "http://localhost:8001";

class RecommendationService {
  // 추천 결과 조회
  async getRecommendations(userId, token) {
    try {
      console.log("=== 추천 결과 조회 ===");
      console.log("사용자 ID:", userId);
      console.log("토큰:", token ? "있음" : "없음");

      const response = await fetch(`${API_BASE_URL}/api/recommend/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("추천 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("추천 결과:", data);
        return data.recommendations || [];
      } else {
        const errorText = await response.text();
        console.error("추천 조회 실패:", errorText);
        throw new Error(`추천 조회 실패: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("추천 조회 오류:", error);
      return [];
    }
  }

  // 사용자 선호도 저장 (키워드)
  async saveKeywordPreferences(userId, token, keywordPreferences) {
    try {
      console.log("=== 키워드 선호도 저장 ===");
      console.log("사용자 ID:", userId);
      console.log("키워드 선호도:", keywordPreferences);

      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}/preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            preferences: keywordPreferences,
          }),
        }
      );

      console.log("키워드 선호도 저장 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("키워드 선호도 저장 성공:", data);
        return true;
      } else {
        const errorText = await response.text();
        console.error("키워드 선호도 저장 실패:", errorText);
        return false;
      }
    } catch (error) {
      console.error("키워드 선호도 저장 오류:", error);
      return false;
    }
  }

  // 편의시설 조회
  async getFeatures(token) {
    try {
      console.log("=== 편의시설 조회 ===");
      const response = await fetch(`${API_BASE_URL}/api/features`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("편의시설 조회 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("편의시설 데이터:", data);
        return data.features || [];
      } else {
        const errorText = await response.text();
        console.error("편의시설 조회 실패:", errorText);
        throw new Error(
          `편의시설 조회 실패: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("편의시설 조회 오류:", error);
      return [];
    }
  }

  // 편의시설 선택 제출
  async submitFeatures(token, selectedFeatures) {
    try {
      console.log("=== 편의시설 선택 제출 ===");
      console.log("선택된 편의시설:", selectedFeatures);

      const response = await fetch(`${API_BASE_URL}/api/features/selections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          features: selectedFeatures,
        }),
      });

      console.log("편의시설 제출 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("편의시설 제출 성공:", data);
        return data.selections || [];
      } else {
        const errorText = await response.text();
        console.error("편의시설 제출 실패:", errorText);
        throw new Error(
          `편의시설 제출 실패: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("편의시설 제출 오류:", error);
      return [];
    }
  }
}

export default new RecommendationService();
