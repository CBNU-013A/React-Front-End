const API_BASE_URL = "/api";

class RecommendationService {
  // 서버 연결 테스트 (실제 API 엔드포인트 사용)
  async testConnection() {
    try {
      console.log("서버 연결 테스트 중...");
      const response = await fetch(
        `${API_BASE_URL}/api/recommend/history/test`,
        {
          method: "GET",
          timeout: 5000,
        }
      );
      console.log("서버 연결 상태:", response.status);
      // 404도 서버가 응답한다는 의미이므로 연결 성공으로 간주
      return response.status === 200 || response.status === 404;
    } catch (error) {
      console.error("서버 연결 실패:", error);
      return false;
    }
  }
  // 지역 기반 추천 (도시만 선택)
  async recommendByRegion(userId, token, cities = [], limit = 10) {
    try {
      console.log("=== 지역 기반 추천 ===");
      console.log("사용자 ID:", userId);
      console.log("선택된 도시들:", cities);
      console.log("제한 개수:", limit);

      const response = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          cities: cities,
          limit: limit,
        }),
      });

      console.log("지역 기반 추천 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("지역 기반 추천 성공:", data);
        return { success: true, data: data };
      } else {
        const errorText = await response.text();
        console.error("지역 기반 추천 실패:", errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error("지역 기반 추천 오류:", error);
      return { success: false, error: error.message };
    }
  }

  // 사용자 기반 추천 (도시 + 사용자 선호도)
  async recommendByUser(userId, token, cities = [], limit = 20) {
    try {
      console.log("=== 사용자 기반 추천 ===");
      console.log("사용자 ID:", userId);
      console.log("선택된 도시들:", cities);
      console.log("제한 개수:", limit);

      const response = await fetch(
        `${API_BASE_URL}/api/recommend/user/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cities: cities,
            limit: limit,
          }),
        }
      );

      console.log("사용자 기반 추천 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("사용자 기반 추천 성공:", data);
        return { success: true, data: data };
      } else {
        const errorText = await response.text();
        console.error("사용자 기반 추천 실패:", errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error("사용자 기반 추천 오류:", error);
      return { success: false, error: error.message };
    }
  }

  // 다단계 필터 추천 (도시 + 카테고리 + 편의시설)
  async multiStepFilter(userId, token, filterData) {
    try {
      console.log("=== 다단계 필터 추천 ===");
      console.log("사용자 ID:", userId);
      console.log("필터 데이터:", filterData);

      const response = await fetch(`${API_BASE_URL}/api/recommend/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          ...filterData,
        }),
      });

      console.log("다단계 필터 추천 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("다단계 필터 추천 성공:", data);
        return { success: true, data: data };
      } else {
        const errorText = await response.text();
        console.error("다단계 필터 추천 실패:", errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error("다단계 필터 추천 오류:", error);
      return { success: false, error: error.message };
    }
  }

  // 추천 히스토리 조회
  async getRecommendHistory(userId, token) {
    try {
      console.log("=== 추천 히스토리 조회 ===");
      console.log("사용자 ID:", userId);

      const response = await fetch(
        `${API_BASE_URL}/api/recommend/history/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("추천 히스토리 조회 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("추천 히스토리 조회 성공:", data);
        return { success: true, data: data };
      } else {
        const errorText = await response.text();
        console.error("추천 히스토리 조회 실패:", errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error("추천 히스토리 조회 오류:", error);
      return { success: false, error: error.message };
    }
  }

  // 사용자 선택 기반 추천 (새로운 메서드)
  async getRecommendationsByUserSelection(userId, token, userSelections) {
    try {
      console.log("=== 사용자 선택 기반 추천 ===");
      console.log("API_BASE_URL:", API_BASE_URL);
      console.log("사용자 ID:", userId);
      console.log("토큰 존재 여부:", !!token);
      console.log("사용자 선택사항:", userSelections);

      const payload = {
        userId,
        city: userSelections.city || [],
        accompany: userSelections.accompany || "",
        season: userSelections.season || "",
        place: userSelections.place || "",
        activity: userSelections.activity || "",
        conveniences: userSelections.conveniences || [],
      };

      console.log("추천 요청 payload:", payload);

      const response = await fetch(`${API_BASE_URL}/api/recommend/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("사용자 선택 기반 추천 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("사용자 선택 기반 추천 성공:", data);
        console.log("추천 결과 개수:", data.recommendations?.length || 0);
        return { success: true, data: data };
      } else {
        const errorText = await response.text();
        console.error("사용자 선택 기반 추천 실패:", errorText);
        console.error("응답 상태:", response.status);
        console.error("응답 헤더:", response.headers);
        return { success: false, error: errorText, status: response.status };
      }
    } catch (error) {
      console.error("사용자 선택 기반 추천 오류:", error);
      return { success: false, error: error.message };
    }
  }

  // 사용자 추천 히스토리 조회 (기존 추천 결과 조회)
  async getRecommendationHistory(userId, token) {
    try {
      console.log("=== 사용자 추천 히스토리 조회 ===");
      console.log("API_BASE_URL:", API_BASE_URL);
      console.log("사용자 ID:", userId);
      console.log("토큰 존재 여부:", !!token);
      console.log(
        "요청 URL:",
        `${API_BASE_URL}/api/recommend/history/${userId}`
      );

      const response = await fetch(
        `${API_BASE_URL}/api/recommend/history/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("추천 히스토리 조회 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("추천 히스토리 조회 성공:", data);
        console.log("히스토리 결과 개수:", data.results?.length || 0);

        // 히스토리 데이터를 추천 결과 형식으로 변환
        const recommendations =
          data.results?.map((result) => ({
            id: result.id,
            title: result.title,
            city: result.city,
            convenienceScore: null, // 히스토리에는 convenienceScore가 없음
          })) || [];

        return {
          success: true,
          data: {
            message: data.message,
            recommendations: recommendations,
            history: data,
          },
        };
      } else {
        const errorText = await response.text();
        console.error("추천 히스토리 조회 실패:", errorText);
        console.error("응답 상태:", response.status);
        return { success: false, error: errorText, status: response.status };
      }
    } catch (error) {
      console.error("추천 히스토리 조회 오류:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new RecommendationService();
