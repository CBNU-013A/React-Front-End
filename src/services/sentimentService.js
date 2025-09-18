const API_BASE_URL = "http://localhost:8001";

class SentimentService {
  // 리뷰 감성 분석 (서버의 analyzeReview 엔드포인트 사용)
  async analyzeSentiment(content, token = null) {
    if (!content || content.trim() === "") {
      return null;
    }

    try {
      console.log("=== 감성 분석 시작 ===");
      console.log("분석할 내용:", content);
      console.log("토큰 존재 여부:", !!token);
      console.log("토큰 타입:", typeof token);
      console.log("토큰 길이:", token ? token.length : 0);

      const headers = {
        "Content-Type": "application/json",
      };

      // 토큰이 있으면 Authorization 헤더 추가
      if (token && token !== "undefined" && token !== "null") {
        headers.Authorization = `Bearer ${token}`;
        console.log("토큰 사용:", token.substring(0, 20) + "...");
        console.log("Authorization 헤더 설정 완료");
      } else {
        console.log("토큰 없이 API 호출 시도");
        console.log("토큰 값:", token);
      }

      console.log("최종 요청 헤더:", headers);

      const response = await fetch(`${API_BASE_URL}/api/review/analyze`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          content: content,
        }),
      });

      console.log("=== API 응답 정보 ===");
      console.log("응답 상태:", response.status);
      console.log("응답 상태 텍스트:", response.statusText);
      console.log("응답 헤더:", Object.fromEntries(response.headers.entries()));
      console.log("응답 URL:", response.url);

      if (response.ok) {
        const result = await response.json();
        console.log("=== API 응답 데이터 ===");
        console.log("전체 응답:", result);
        console.log("rawSentiments:", result.rawSentiments);
        console.log("processed:", result.processed);

        return {
          success: true,
          rawSentiments: result.rawSentiments,
          processed: result.processed,
          sentiments: result.rawSentiments, // rawSentiments를 sentiments로 사용
          summary: result.summary,
        };
      } else {
        const errorText = await response.text();
        console.error("=== 감성 분석 실패 ===");
        console.error("상태 코드:", response.status);
        console.error("상태 텍스트:", response.statusText);
        console.error("에러 메시지:", errorText);
        console.error("응답 URL:", response.url);
        console.error("요청 헤더:", headers);
        return { success: false, error: errorText, status: response.status };
      }
    } catch (error) {
      console.error("감성 분석 오류:", error);
      return { success: false, error: error.message };
    }
  }

  // 감성 분석 결과를 사용자 친화적인 형태로 변환
  formatSentimentResult(sentimentData) {
    if (!sentimentData || !sentimentData.success) {
      return null;
    }

    const { rawSentiments, processed } = sentimentData;

    // 원시 감성 분석 결과를 사용자 친화적으로 변환
    const formattedResult = {
      overall: this.getOverallSentiment(rawSentiments),
      aspects: this.formatAspects(processed),
      summary: this.generateSummary(rawSentiments, processed),
    };

    return formattedResult;
  }

  // 전체적인 감성 판단
  getOverallSentiment(rawSentiments) {
    if (!rawSentiments) return "neutral";

    const sentiments = Object.values(rawSentiments);
    const positiveCount = sentiments.filter((s) => s === "pos").length;
    const negativeCount = sentiments.filter((s) => s === "neg").length;

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  // 각 측면별 감성 정보 포맷팅
  formatAspects(processed) {
    if (!processed || !Array.isArray(processed)) return [];

    return processed.map((item) => ({
      aspect: item.aspect,
      sentiment: {
        positive: item.sentiment.pos === 1,
        negative: item.sentiment.neg === 1,
        neutral: item.sentiment.none === 1,
      },
    }));
  }

  // 감성 분석 요약 생성
  generateSummary(rawSentiments) {
    if (!rawSentiments) return "분석 결과를 가져올 수 없습니다.";

    const overall = this.getOverallSentiment(rawSentiments);
    const aspectCount = Object.keys(rawSentiments).length;

    const sentimentText = {
      positive: "긍정적",
      negative: "부정적",
      neutral: "중립적",
    };

    return `전체적으로 ${sentimentText[overall]}인 감정이 ${aspectCount}개 측면에서 분석되었습니다.`;
  }

  // 장소별 분석 데이터 가져오기 (백엔드 getLocationByPlaceID API 활용)
  async getLocationAnalysis(locationId) {
    try {
      console.log("=== 장소 분석 데이터 가져오기 시작 ===");
      console.log("장소 ID:", locationId);

      // 백엔드의 getLocationByPlaceID API 사용
      const response = await fetch(
        `${API_BASE_URL}/api/location/placeID/${locationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("분석 데이터 응답 상태:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("분석 데이터 결과:", result);

        // keywords 필드가 있는지 확인
        if (result.keywords && Array.isArray(result.keywords)) {
          return {
            success: true,
            data: result,
          };
        } else {
          console.warn("장소 데이터에 keywords 필드가 없습니다.");
          return {
            success: false,
            error: "이 장소에는 키워드 분석 데이터가 없습니다.",
          };
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("분석 데이터 가져오기 실패:", errorData);
        return {
          success: false,
          error: errorData.message || "분석 데이터를 가져오는데 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("분석 데이터 가져오기 중 오류:", error);
      return {
        success: false,
        error: "네트워크 오류가 발생했습니다.",
      };
    }
  }
}

export default new SentimentService();
