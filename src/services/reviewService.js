import { getConvenienceKeywordName } from "../constants/convenienceKeywords";

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

  // 리뷰 작성 (categories 지원 추가)
  async createReview(placeId, content, token, categories = []) {
    try {
      console.log("=== 리뷰 작성 ===");
      console.log("장소 ID:", placeId);
      console.log("내용:", content);
      console.log("카테고리:", categories);

      const response = await fetch(`${API_BASE_URL}/api/review/${placeId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          categories: categories,
        }),
      });

      console.log("리뷰 작성 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("리뷰 작성 성공:", data);
        return { success: true, review: data.review };
      } else {
        const errorText = await response.text();
        console.error("리뷰 작성 실패:", errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error("리뷰 작성 오류:", error);
      return { success: false, error: error.message };
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

  // 리뷰 수정 (categories 지원 추가)
  async updateReview(reviewId, content, token, categories = []) {
    try {
      console.log("=== 리뷰 수정 ===");
      console.log("리뷰 ID:", reviewId);
      console.log("내용:", content);
      console.log("카테고리:", categories);

      const response = await fetch(`${API_BASE_URL}/api/review/${reviewId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          categories: categories,
        }),
      });

      console.log("📡 PATCH 상태 코드:", response.status);
      const responseText = await response.text();
      console.log("📨 응답 본문:", responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        return { success: true, review: data.review };
      } else {
        return { success: false, error: responseText };
      }
    } catch (error) {
      console.error("리뷰 수정 오류:", error);
      return { success: false, error: error.message };
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
            sentimentAspects: review.sentimentAspects || [],
            createdAt: review.createdAt,
            keywords: review.keywords || [],
          };
          console.log("처리된 리뷰:", processedReview);
          console.log("감성 분석 데이터:", review.sentimentAspects);
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

  // 감성 분석 전용 (저장하지 않고 분석만)
  async analyzeReview(content) {
    try {
      console.log("=== 감성 분석 전용 ===");
      console.log("분석할 내용:", content);

      const response = await fetch(
        `https://api.pikyourtour.com/api/review/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content,
          }),
        }
      );

      console.log("감성 분석 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("감성 분석 결과:", data);
        return {
          success: true,
          rawSentiments: data.rawSentiments,
          processed: data.processed,
        };
      } else {
        const errorText = await response.text();
        console.error("감성 분석 실패:", errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error("감성 분석 오류:", error);
      return { success: false, error: error.message };
    }
  }
  // 장소의 리뷰를 현재 사용자 기준으로 분리해서 반환 (한 번의 요청으로 해결)
  async getSplitReviewsByLocation(locationId, token, userId) {
    try {
      console.log("=== 리뷰 분리 조회 (내 리뷰 / 다른 리뷰) ===");
      console.log("locationId:", locationId);
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/api/review/${locationId}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("리뷰 분리 조회 실패:", errorText);
        return { mine: null, others: [], error: errorText };
      }

      const data = await response.json();
      console.log("=== 리뷰 데이터 구조 확인 ===");
      console.log("전체 응답 데이터:", data);
      console.log("리뷰 배열:", data.reviews);
      console.log("리뷰 개수:", data.reviews?.length || 0);

      if (data.reviews && data.reviews.length > 0) {
        console.log("첫 번째 리뷰 구조:", data.reviews[0]);
        console.log("첫 번째 리뷰 키들:", Object.keys(data.reviews[0]));
      }

      const reviews = (data.reviews || []).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a._id);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b._id);
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime()))
          return b._id.localeCompare(a._id);
        return dateB - dateA;
      });

      // 내 리뷰와 다른 리뷰를 분리
      console.log("=== 리뷰 분리 시작 ===");
      console.log("사용자 ID:", userId);
      console.log("리뷰 개수:", reviews.length);

      let mine = null;
      const others = [];
      for (const r of reviews) {
        //   console.log("리뷰 확인:", {
        //     id: r._id,
        //     author: r.author,
        //     userId: userId,
        //     isMatch: r.author === userId,
        //   });

        if (userId && r.author === userId && mine === null) {
          // 가장 최신 1개만 "내 리뷰"로 잡고, 나머지는 others로 둠
          mine = {
            id: r._id,
            content: r.content || "",
            author: r.author || "",
            locationId: r.location?._id || locationId,
            createdAt: r.createdAt,
            categories: r.categories || [],
            keywords: r.keywords || [],
            sentimentAspects: r.sentimentAspects || [],
          };
          continue;
        }
        others.push(r);
      }

      console.log("=== 리뷰 분리 결과 ===");
      console.log("내 리뷰:", mine);
      console.log("다른 리뷰 개수:", others.length);
      console.log(
        "다른 리뷰들:",
        others.map((r) => ({ id: r._id, author: r.author }))
      );

      return { mine, others };
    } catch (error) {
      console.error("리뷰 분리 조회 오류:", error);
      return { mine: null, others: [], error: error.message };
    }
  }

  // 감성 분석 전용 메서드 (임시 리뷰 생성 후 삭제)
  async analyzeSentiment(
    content,
    token,
    locationId = "682fe9b8a853cdd2f586905e"
  ) {
    try {
      console.log("=== 리뷰 서비스 - 감성 분석 (임시 리뷰 생성) ===");
      console.log("분석할 내용:", content);
      console.log("토큰 존재 여부:", !!token);
      console.log("사용할 locationId:", locationId);

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // 1단계: 임시 리뷰 생성 (감성 분석 포함)
      const createResponse = await fetch(
        `${API_BASE_URL}/api/review/${locationId}`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            content: content,
            categories: [], // 빈 배열로 전달
          }),
        }
      );

      console.log("리뷰 생성 응답 상태:", createResponse.status);

      if (createResponse.ok) {
        const result = await createResponse.json();
        console.log("리뷰 생성 결과:", result);

        // 편의성 키워드 매핑은 별도 상수 파일에서 가져옴

        // 응답에서 sentimentAspects 추출
        const sentimentAspects = result.review?.sentimentAspects || [];
        const rawSentiments = {};

        // sentimentAspects를 rawSentiments 형태로 변환
        sentimentAspects.forEach((aspect) => {
          if (aspect.aspect && aspect.sentiment) {
            // ObjectId를 키워드 이름으로 변환
            const aspectId = aspect.aspect._id || aspect.aspect;
            const aspectName = getConvenienceKeywordName(aspectId);

            if (aspect.sentiment.pos === 1) {
              rawSentiments[aspectName] = "pos";
            } else if (aspect.sentiment.neg === 1) {
              rawSentiments[aspectName] = "neg";
            } else {
              rawSentiments[aspectName] = "none";
            }
          }
        });

        // 2단계: 임시 리뷰 삭제 (선택사항)
        if (result.review?._id) {
          try {
            const deleteResponse = await fetch(
              `${API_BASE_URL}/api/review/${result.review._id}`,
              {
                method: "DELETE",
                headers: headers,
              }
            );
            console.log("임시 리뷰 삭제 상태:", deleteResponse.status);
          } catch (deleteError) {
            console.log("임시 리뷰 삭제 실패 (무시):", deleteError);
          }
        }

        return {
          success: true,
          rawSentiments: rawSentiments,
          processed: sentimentAspects,
          sentiments: rawSentiments,
          summary: null,
        };
      } else {
        const errorText = await createResponse.text();
        console.error("감성 분석 실패:", errorText);
        return {
          success: false,
          error: errorText,
          status: createResponse.status,
        };
      }
    } catch (error) {
      console.error("감성 분석 오류:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new ReviewService();
