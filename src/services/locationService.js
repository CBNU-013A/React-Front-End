// LocationService - Flutter LocationService와 동일한 기능
const baseUrl = "http://localhost:8001";

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

  // 특정 장소 조회
  async fetchLocation(placeId) {
    if (!placeId || placeId.trim() === "") {
      throw new Error("placeId is empty");
    }

    try {
      const response = await fetch(`${baseUrl}/api/location/id/${placeId}`);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to load location data: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error;
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
}

// 인스턴스 생성 및 내보내기
const locationService = new LocationService();
const recentSearchService = new RecentSearchService();

export { locationService, recentSearchService };
export default locationService;
