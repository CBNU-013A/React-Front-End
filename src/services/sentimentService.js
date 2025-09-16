const API_BASE_URL = "http://localhost:8001";

class SentimentService {
  // 리뷰 감성 분석
  async analyzeSentiment(content) {
    if (!content || content.trim() === "") {
      return null;
    }

    try {
      console.log("=== 감성 분석 시작 ===");
      console.log("분석할 내용:", content);

      const response = await fetch(`${API_BASE_URL}/api/sentiment/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
        }),
      });

      console.log("감성 분석 응답 상태:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("감성 분석 결과:", result);
        return result;
      } else {
        const errorText = await response.text();
        console.error("감성 분석 실패:", errorText);
        throw new Error(`감성 분석 실패: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("감성 분석 오류:", error);
      return null;
    }
  }
}

export default new SentimentService();
