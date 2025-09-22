// LocationService - Flutter LocationService와 동일한 기능
const baseUrl = "";

class LocationService {
  // 모든 장소 조회
  async fetchAllLocations() {
    try {
      const response = await fetch(`${baseUrl}/api/location/all`);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to load all locations: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching all locations:", error);
      throw error;
    }
  }

  // 모든 장소 조회 (별칭)
  async getAllLocations() {
    return this.fetchAllLocations();
  }

  // 특정 장소 조회
  async fetchLocation(placeId) {
    if (!placeId || placeId.trim() === "") {
      throw new Error("placeId is empty");
    }

    try {
      // 백엔드 API 경로: /api/location/id/:placeID
      const response = await fetch(`${baseUrl}/api/location/id/${placeId}`);
      console.log("API 요청 URL:", `${baseUrl}/api/location/id/${placeId}`);

      console.log("응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("장소 데이터:", data);
        return data;
      } else {
        const errorText = await response.text();
        console.error("API 응답 오류:", errorText);
        throw new Error(`Failed to load location data: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      // 네트워크 에러나 서버 연결 실패인 경우 원본 에러를 유지
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("fetch")
      ) {
        throw error;
      }
      throw new Error(`Failed to load location data: ${error.message}`);
    }
  }

  // ID 목록으로 장소들 조회
  async fetchLocationsByIds(placeIds) {
    const locations = [];

    for (const id of placeIds) {
      try {
        const location = await this.fetchLocation(id);
        locations.push(location);
      } catch (error) {
        console.warn(`Failed to fetch location with id ${id}:`, error);
        // 개별 장소 조회 실패는 무시하고 계속 진행
      }
    }

    return locations;
  }

  // 장소 검색 (제목으로 검색) - Flutter와 동일한 엔드포인트 사용
  async searchLocations(query) {
    try {
      // 먼저 모든 장소를 가져온 후 클라이언트에서 필터링
      const allLocations = await this.fetchAllLocations();

      const searchQuery = query.toLowerCase();
      const titleMatches = [];
      const overviewMatches = [];

      // 1순위: 여행지 이름(title)에서 검색
      allLocations.forEach((location) => {
        if (
          location.title &&
          location.title.toLowerCase().includes(searchQuery)
        ) {
          titleMatches.push(location);
        }
      });

      // 2순위: 소개글(overview)에서 검색 (이미 title에서 매칭된 것은 제외)
      const titleIds = new Set(titleMatches.map((loc) => loc._id));
      allLocations.forEach((location) => {
        if (
          !titleIds.has(location._id) &&
          location.overview &&
          location.overview.toLowerCase().includes(searchQuery)
        ) {
          overviewMatches.push(location);
        }
      });

      // 1순위 결과 + 2순위 결과 반환
      return [...titleMatches, ...overviewMatches];
    } catch (error) {
      console.error("Error searching locations:", error);
      throw error;
    }
  }
}

// 최근 검색 기록 서비스
class RecentSearchService {
  // 최근 검색 장소 추가
  async addRecentSearch(userId, location) {
    try {
      const response = await fetch(
        `${baseUrl}/api/users/${userId}/recentsearch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ location }),
        }
      );

      if (response.status === 201) {
        return true;
      } else {
        console.error(`Failed to add recent search: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error("Error adding recent search:", error);

      // 백엔드 연결 실패 시 로컬 스토리지에 저장
      console.log("Backend not available, saving to localStorage");
      this.saveToLocalStorage(userId, location);
      return true;
    }
  }

  // 최근 검색 장소 조회
  async fetchRecentSearch(userId) {
    try {
      const response = await fetch(
        `${baseUrl}/api/users/${userId}/recentsearch`
      );

      if (response.ok) {
        const data = await response.json();
        return data.map((item) => ({
          _id: item._id,
          title: item.title,
          image: item.firstimage,
        }));
      } else {
        console.error(`Failed to fetch recent search: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.error("Error fetching recent search:", error);

      // 백엔드 연결 실패 시 로컬 스토리지에서 조회
      console.log("Backend not available, loading from localStorage");
      return this.loadFromLocalStorage(userId);
    }
  }

  // 최근 검색 장소 삭제
  async deleteRecentSearch(userId, locationId) {
    try {
      const response = await fetch(
        `${baseUrl}/api/users/${userId}/recentsearch/${locationId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        return true;
      } else {
        console.error(`Failed to delete recent search: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error("Error deleting recent search:", error);

      // 백엔드 연결 실패 시 로컬 스토리지에서 삭제
      console.log("Backend not available, deleting from localStorage");
      return this.deleteFromLocalStorage(userId, locationId);
    }
  }

  // 최근 검색 전체 초기화
  async resetRecentSearch(userId) {
    try {
      const response = await fetch(
        `${baseUrl}/api/users/${userId}/recentsearch`,
        { method: "DELETE" }
      );

      if (response.ok) {
        return true;
      } else {
        console.error(`Failed to reset recent search: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error("Error resetting recent search:", error);
      return false;
    }
  }

  // 로컬 스토리지에 최근 검색 저장
  saveToLocalStorage(userId, location) {
    try {
      const key = `recent_search_${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");

      // 중복 제거 (같은 ID가 있으면 제거)
      const filtered = existing.filter((item) => item._id !== location._id);

      // 새 항목을 맨 앞에 추가
      const updated = [
        {
          _id: location._id,
          title: location.title,
          firstimage: location.firstimage,
        },
        ...filtered,
      ];

      // 최대 10개까지만 저장
      const limited = updated.slice(0, 10);

      localStorage.setItem(key, JSON.stringify(limited));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  // 로컬 스토리지에서 최근 검색 조회
  loadFromLocalStorage(userId) {
    try {
      const key = `recent_search_${userId}`;
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      return data;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return [];
    }
  }

  // 로컬 스토리지에서 최근 검색 삭제
  deleteFromLocalStorage(userId, locationId) {
    try {
      const key = `recent_search_${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const filtered = existing.filter((item) => item._id !== locationId);
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting from localStorage:", error);
      return false;
    }
  }

  // 로컬 스토리지에서 최근 검색 전체 삭제
  clearLocalStorage(userId) {
    try {
      const key = `recent_search_${userId}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }

  // 장소의 필드와 분석 데이터 가져오기
  async fetchLocationAnalysis(placeId) {
    if (!placeId || placeId.trim() === "") {
      throw new Error("placeId is empty");
    }

    try {
      console.log("=== 장소 분석 데이터 가져오기 시작 ===");
      console.log("장소 ID:", placeId);

      const response = await fetch(
        `${baseUrl}/api/location/${placeId}/analysis`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("장소 분석 데이터:", data);
        return data;
      } else {
        throw new Error(`Failed to load location analysis: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching location analysis:", error);
      // 네트워크 에러나 서버 연결 실패인 경우 원본 에러를 유지
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("fetch")
      ) {
        throw error;
      }
      throw new Error("장소 분석 데이터를 불러오는데 실패했습니다.");
    }
  }

  // 장소의 필드별 감정 분석 데이터 가져오기
  async fetchLocationSentimentFields(placeId) {
    if (!placeId || placeId.trim() === "") {
      throw new Error("placeId is empty");
    }

    try {
      console.log("=== 장소 필드별 감정 분석 데이터 가져오기 시작 ===");
      console.log("장소 ID:", placeId);

      // 백엔드의 getLocationByPlaceID API 사용
      const response = await fetch(
        `${baseUrl}/api/location/placeID/${placeId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("장소 데이터 (필드별 감정 분석 포함):", data);

        // aggregatedAnalysis 필드가 있는지 확인
        if (
          data.aggregatedAnalysis &&
          data.aggregatedAnalysis.sentimentAspects
        ) {
          return data;
        } else {
          console.warn(
            "장소 데이터에 aggregatedAnalysis.sentimentAspects가 없습니다."
          );
          return null;
        }
      } else {
        throw new Error(`Failed to load location data: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching location sentiment fields:", error);
      // 네트워크 에러나 서버 연결 실패인 경우 원본 에러를 유지
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("fetch")
      ) {
        throw error;
      }
      throw new Error(
        "장소 필드별 감정 분석 데이터를 불러오는데 실패했습니다."
      );
    }
  }

  // 장소 이름으로 장소 데이터 가져오기 (백엔드 getLocationByPlaceName API 활용)
  async fetchLocationByPlaceName(placeName) {
    if (!placeName || placeName.trim() === "") {
      throw new Error("placeName is empty");
    }

    try {
      console.log("=== 장소 이름으로 데이터 가져오기 시작 ===");
      console.log("장소 이름:", placeName);

      // 백엔드의 getLocationByPlaceName API 사용
      const response = await fetch(
        `${baseUrl}/api/location/placeName/${encodeURIComponent(placeName)}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("장소 데이터 (이름으로 조회):", data);
        return data;
      } else {
        throw new Error(`Failed to load location by name: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching location by name:", error);
      // 네트워크 에러나 서버 연결 실패인 경우 원본 에러를 유지
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("fetch")
      ) {
        throw error;
      }
      throw new Error("장소 데이터를 불러오는데 실패했습니다.");
    }
  }
}

// 인스턴스 생성 및 내보내기
const locationService = new LocationService();
const recentSearchService = new RecentSearchService();

export { locationService, recentSearchService };
export default locationService;
