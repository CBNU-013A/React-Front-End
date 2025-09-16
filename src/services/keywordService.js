const API_BASE_URL = "http://localhost:8001";

class KeywordService {
  // 대분류 키워드 조회
  async getAllKeywords() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keywords/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data || [];
      } else {
        throw new Error(`키워드 조회 실패: ${response.status}`);
      }
    } catch (error) {
      console.error("키워드 조회 오류:", error);
      return [];
    }
  }

  // 카테고리 조회
  async getCategory() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keywords/category`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data || [];
      } else {
        throw new Error(`카테고리 조회 실패: ${response.status}`);
      }
    } catch (error) {
      console.error("카테고리 조회 오류:", error);
      return [];
    }
  }

  // 소분류 키워드 조회
  async getSubKeywords(categoryId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/categories/${categoryId}/subkeywords`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.subcategories || [];
      } else {
        throw new Error(`소분류 키워드 조회 실패: ${response.status}`);
      }
    } catch (error) {
      console.error("소분류 키워드 조회 오류:", error);
      return [];
    }
  }
}

export default new KeywordService();
