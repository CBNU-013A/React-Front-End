const API_BASE_URL = "/api";

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
      console.log("=== 카테고리 조회 시작 ===");
      console.log("API URL:", `${API_BASE_URL}/api/categories`);

      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("카테고리 조회 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("카테고리 조회 성공:", data);
        return data.categories || [];
      } else {
        const errorText = await response.text();
        console.error("카테고리 조회 실패:", errorText);
        throw new Error(`카테고리 조회 실패: ${response.status}`);
      }
    } catch (error) {
      console.error("카테고리 조회 오류:", error);
      return [];
    }
  }

  // PreferenceTag 조회 (소분류 키워드)
  async getSubKeywords(categoryId) {
    try {
      console.log("=== PreferenceTag 조회 시작 ===");
      console.log("카테고리 ID:", categoryId);
      console.log(
        "API URL:",
        `${API_BASE_URL}/api/categories/${categoryId}/preferenceTags`
      );

      const response = await fetch(
        `${API_BASE_URL}/api/categories/${categoryId}/preferenceTags`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("PreferenceTag 조회 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("PreferenceTag 조회 성공:", data);
        return data.preferenceTags || [];
      } else {
        const errorText = await response.text();
        console.error("PreferenceTag 조회 실패:", errorText);
        throw new Error(`PreferenceTag 조회 실패: ${response.status}`);
      }
    } catch (error) {
      console.error("PreferenceTag 조회 오류:", error);
      return [];
    }
  }

  // PreferenceTag 선택 제출
  async submitPreferenceTagSelections(selections) {
    try {
      console.log("=== PreferenceTag 선택 제출 시작 ===");
      console.log("선택된 PreferenceTag ID들:", selections);

      const response = await fetch(
        `${API_BASE_URL}/api/categories/selections`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selections: selections,
          }),
        }
      );

      console.log("PreferenceTag 선택 제출 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("PreferenceTag 선택 제출 성공:", data);
        return { success: true, data: data.selections || [] };
      } else {
        const errorText = await response.text();
        console.error("PreferenceTag 선택 제출 실패:", errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error("PreferenceTag 선택 제출 오류:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new KeywordService();
