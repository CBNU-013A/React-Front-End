// LikeService - Flutter LikeService 기반
const baseUrl = "http://localhost:8001";

class LikeService {
  constructor() {
    this.baseUrl = baseUrl;
    this._isLiked = false;
  }

  // 사용자가 특정 장소를 좋아요했는지 확인
  async isPlaceLikedByUser(userId, placeId, token) {
    try {
      const likedPlaces = await this.loadUserLikePlaces(userId, token);
      const isLiked = likedPlaces.some((place) => place._id === placeId);
      this._isLiked = isLiked;
      return isLiked;
    } catch (error) {
      console.error("좋아요 상태 확인 실패:", error);
      return false;
    }
  }

  // 좋아요 추가
  async addUserLike(userId, placeId) {
    try {
      const url = `${this.baseUrl}/api/users/${userId}/likes`;
      console.log("좋아요 추가 API 호출:", { url, placeId });
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationId: placeId }),
      });
      console.log("좋아요 추가 API 응답:", {
        status: response.status,
        statusText: response.statusText,
      });
      return response.status === 200;
    } catch (error) {
      console.error("좋아요 추가 실패:", error);
      return false;
    }
  }

  // 좋아요 제거
  async removeUserLike(userId, placeId) {
    try {
      const url = `${this.baseUrl}/api/users/${userId}/likes`;
      console.log("좋아요 제거 API 호출:", { url, placeId });
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationId: placeId }),
      });
      console.log("좋아요 제거 API 응답:", {
        status: response.status,
        statusText: response.statusText,
      });
      return response.status === 200;
    } catch (error) {
      console.error("좋아요 제거 실패:", error);
      return false;
    }
  }

  // 좋아요 토글
  async toggleLike(userId, placeId, token, isLiked) {
    try {
      if (isLiked) {
        return await this.removeUserLike(userId, placeId);
      } else {
        return await this.addUserLike(userId, placeId);
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      return false;
    }
  }

  // 사용자의 좋아요한 장소 목록 가져오기
  async loadUserLikePlaces(userId, token) {
    try {
      const url = `${this.baseUrl}/api/users/${userId}/likes`;
      console.log("좋아요 목록 API 호출:", { url, userId });
      const response = await fetch(url);
      console.log("좋아요 목록 API 응답:", {
        status: response.status,
        statusText: response.statusText,
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log("좋아요 목록 데이터:", data);
        return data.likes || [];
      }
      return [];
    } catch (error) {
      console.error("좋아요 목록 로드 실패:", error);
      return [];
    }
  }

  // 장소에 좋아요 추가 (장소명 기반)
  async likeLocation(placeName, token) {
    try {
      // 한글 장소명을 URL 인코딩
      const encodedPlaceName = encodeURIComponent(placeName);
      const url = `${this.baseUrl}/api/location/${encodedPlaceName}/likes`;
      console.log("장소 좋아요 API 호출:", {
        url,
        placeName,
        encodedPlaceName,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("장소 좋아요 API 응답:", {
        status: response.status,
        statusText: response.statusText,
      });

      return response.status === 201;
    } catch (error) {
      console.error("장소 좋아요 실패:", error);
      return false;
    }
  }

  // 장소의 좋아요 개수 가져오기
  async getLocationLikeCount(placeName, token) {
    try {
      // 한글 장소명을 URL 인코딩
      const encodedPlaceName = encodeURIComponent(placeName);
      const url = `${this.baseUrl}/api/location/${encodedPlaceName}/likes`;
      console.log("좋아요 개수 API 호출:", {
        url,
        placeName,
        encodedPlaceName,
      });

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("좋아요 개수 API 응답:", {
        status: response.status,
        statusText: response.statusText,
      });

      if (response.status === 200) {
        const data = await response.json();
        return data.likeCount || 0;
      } else {
        console.warn(
          `좋아요 개수 조회 실패: ${response.status} ${response.statusText}`
        );
        return 0;
      }
    } catch (error) {
      console.error("좋아요 개수 조회 실패:", error);
      return 0;
    }
  }
}

export default new LikeService();
