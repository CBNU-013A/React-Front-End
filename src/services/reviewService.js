const API_BASE_URL = "http://localhost:8001";

class ReviewService {
  // 장소별 리뷰 조회
  async getReviewsByLocation(locationId, token) {
    try {
      console.log("=== 리뷰 서비스 - 장소별 리뷰 조회 ===");
      console.log("API URL:", `${API_BASE_URL}/api/review/${locationId}`);
      console.log("Token:", token ? "있음" : "없음");

      const headers = {
        "Content-Type": "application/json",
      };

      // 토큰이 있으면 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/review/${locationId}`, {
        method: "GET",
        headers: headers,
      });

      console.log("응답 상태:", response.status);
      console.log("응답 OK:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("응답 데이터:", data);
        console.log("리뷰 배열:", data.reviews);

        const reviews = data.reviews || [];
        // 최신순으로 정렬 (createdAt 또는 _id 기준)
        return reviews.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a._id);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b._id);

          // 날짜가 유효하지 않은 경우 _id로 정렬 (MongoDB ObjectId는 시간 정보 포함)
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
            return b._id.localeCompare(a._id);
          }

          return dateB - dateA;
        });
      } else {
        const errorText = await response.text();
        console.error("서버 오류 응답:", errorText);
        throw new Error(`리뷰 조회 실패: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("리뷰 조회 오류:", error);
      throw error;
    }
  }

  // 현재 사용자의 리뷰 조회 (특정 장소) - Flutter와 동일한 방식
  async getUserReviewByLocation(locationId, token, userId) {
    try {
      console.log("=== 사용자 리뷰 조회 ===");
      console.log("locationId:", locationId);
      console.log("userId:", userId);

      const headers = {
        "Content-Type": "application/json",
      };

      // 토큰이 있으면 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/review/${locationId}`, {
        method: "GET",
        headers: headers,
      });

      console.log("사용자 리뷰 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        const reviews = data.reviews || [];
        console.log("모든 리뷰:", reviews);

        // 현재 사용자(author)의 리뷰만 필터링
        const userReview = reviews.find((review) => review.author === userId);
        console.log("사용자 리뷰:", userReview);

        if (userReview && userReview.content && userReview._id) {
          return {
            content: userReview.content,
            reviewId: userReview._id,
          };
        }
      } else {
        const errorText = await response.text();
        console.error("사용자 리뷰 조회 실패:", errorText);
        throw new Error(
          `사용자 리뷰 조회 실패: ${response.status} - ${errorText}`
        );
      }
      return null;
    } catch (error) {
      console.error("사용자 리뷰 조회 오류:", error);
      return null;
    }
  }

  // 리뷰 작성
  async createReview(placeId, content, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/review/${placeId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
        }),
      });

      return response.status === 201;
    } catch (error) {
      console.error("리뷰 작성 오류:", error);
      return false;
    }
  }

  // 리뷰 삭제
  async deleteReview(reviewId, token) {
    if (!reviewId || !token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/review/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error("리뷰 삭제 오류:", error);
      return false;
    }
  }

  // 리뷰 수정
  async updateReview(reviewId, content, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/review/${reviewId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
        }),
      });

      console.log("📡 PATCH 상태 코드:", response.status);
      const responseText = await response.text();
      console.log("📨 응답 본문:", responseText);

      return response.status === 200;
    } catch (error) {
      console.error("리뷰 수정 오류:", error);
      return false;
    }
  }

  // 사용자의 모든 리뷰 조회
  async getReviewsByUser(token, userId) {
    if (!token || !userId) {
      console.log("토큰 또는 사용자 ID가 없음");
      return [];
    }

    try {
      console.log("=== 사용자별 리뷰 조회 ===");
      console.log("API URL:", `${API_BASE_URL}/api/review/user/${userId}`);
      console.log("사용자 ID:", userId);
      console.log("토큰:", token ? "있음" : "없음");

      const response = await fetch(
        `${API_BASE_URL}/api/review/user/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("사용자 리뷰 응답 상태:", response.status);
      console.log("사용자 리뷰 응답 OK:", response.ok);

      if (response.ok) {
        const data = await response.json();
        const reviews = data.reviews || [];
        console.log("서버에서 받은 사용자 리뷰:", reviews);

        const processedReviews = reviews.reverse().map((review) => {
          const location = review.location;
          const processedReview = {
            id: review._id,
            content: review.content || "",
            author: review.author || "",
            location:
              location && typeof location === "object"
                ? location.title || ""
                : "",
            locationId:
              location && typeof location === "object"
                ? location._id || ""
                : "",
          };
          console.log("처리된 리뷰:", processedReview);
          return processedReview;
        });

        console.log("최종 처리된 사용자 리뷰 목록:", processedReviews);
        return processedReviews;
      } else {
        const errorText = await response.text();
        console.error("사용자 리뷰 조회 실패:", errorText);
        throw new Error(
          `사용자 리뷰 조회 실패: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("사용자 리뷰 조회 오류:", error);
      return [];
    }
  }
}

export default new ReviewService();
