const BASE_URL = "";

/**
 * API 응답 데이터 검증 및 정리
 * @param {Array} data - API 응답 데이터
 * @returns {Array} 검증된 데이터
 */
const validateLocationData = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((location) => {
    // keywords 필드 안전하게 처리
    let safeKeywords = [];
    if (location.keywords && Array.isArray(location.keywords)) {
      safeKeywords = location.keywords.map((keyword) => {
        if (typeof keyword === "string") {
          return keyword;
        } else if (typeof keyword === "object" && keyword !== null) {
          // 객체인 경우 subKeyword, positive, negative 중 하나를 선택
          return (
            keyword.subKeyword || keyword.positive || keyword.negative || "태그"
          );
        }
        return "태그";
      });
    }

    return {
      ...location,
      keywords: safeKeywords,
      title: location.title || "제목 없음",
      addr1: location.addr1 || "주소 없음",
      firstimage: location.firstimage || null,
      firstimage2: location.firstimage2 || null,
    };
  });
};

/**
 * 랜덤 장소 10개 가져오기
 * @returns {Promise<Array>} 랜덤 장소 목록
 */
export const getRandomLocations = async () => {
  try {
    const url = `${BASE_URL}/api/location/random`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return validateLocationData(data);
    } else {
      console.error("Random locations API error:", response.status);
      const errorText = await response.text();
      console.error("Response:", errorText);
      return [];
    }
  } catch (error) {
    console.error("Error fetching random locations:", error);
    return [];
  }
};

/**
 * 특정 장소 상세 정보 가져오기
 * @param {string} locationId - 장소 ID
 * @returns {Promise<Object|null>} 장소 상세 정보
 */
export const getLocationDetails = async (locationId) => {
  try {
    const url = `${BASE_URL}/api/location/${locationId}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Location details API error:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching location details:", error);
    return null;
  }
};

/**
 * 장소 검색
 * @param {string} query - 검색어
 * @returns {Promise<Array>} 검색 결과
 */
export const searchLocations = async (query) => {
  try {
    const url = `${BASE_URL}/api/location/search?q=${encodeURIComponent(
      query
    )}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Search locations API error:", response.status);
      return [];
    }
  } catch (error) {
    console.error("Error searching locations:", error);
    return [];
  }
};
