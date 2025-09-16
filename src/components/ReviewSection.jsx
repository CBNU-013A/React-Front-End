import React, { useState, useEffect, useCallback } from "react";
import useAuthStore from "../stores/authStore";
import reviewService from "../services/reviewService";
import sentimentService from "../services/sentimentService";

const ReviewSection = ({ locationId, locationName }) => {
  const { user, token, isAuthenticated } = useAuthStore();

  // 감성 분석 결과 번역 함수
  const translateSentiment = (value) => {
    switch (value) {
      case "pos":
        return "긍정";
      case "neg":
        return "부정";
      case "none":
      default:
        return "없음";
    }
  };
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentimentResult, setSentimentResult] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 리뷰 데이터 로드
  const loadReviews = useCallback(async () => {
    try {
      console.log("=== 리뷰 로드 시작 ===");
      console.log("locationId:", locationId);
      console.log("token:", token ? "있음" : "없음");
      console.log("isAuthenticated:", isAuthenticated);
      console.log("user:", user);

      // userReview 초기화
      setUserReview(null);
      setSentimentResult({});

      setLoading(true);

      const allReviews = await reviewService.getReviewsByLocation(
        locationId,
        token || null
      );
      console.log("불러온 리뷰들:", allReviews);
      setReviews(allReviews);

      // 로그인한 사용자의 리뷰 확인 - 사용자별 리뷰 API 사용
      if (isAuthenticated && user && user._id && token) {
        console.log("사용자별 리뷰 조회 중...");
        console.log("사용자 ID:", user._id);

        const userReviews = await reviewService.getReviewsByUser(
          token,
          user._id
        );
        console.log("사용자의 모든 리뷰:", userReviews);

        // 현재 장소의 리뷰만 필터링
        console.log("현재 장소 ID:", locationId);
        console.log(
          "사용자 리뷰들의 locationId들:",
          userReviews.map((r) => r.locationId)
        );

        const currentLocationReview = userReviews.find((review) => {
          const isLocationMatch =
            String(review.locationId) === String(locationId);
          const isAuthorMatch = String(review.author) === String(user._id);
          console.log(
            `리뷰 ${review.id}: locationId=${review.locationId}, author=${review.author}, 현재장소=${locationId}, 현재사용자=${user._id}`
          );
          console.log(
            `장소매치=${isLocationMatch}, 작성자매치=${isAuthorMatch}`
          );
          return isLocationMatch && isAuthorMatch;
        });

        console.log("찾은 현재 장소 리뷰:", currentLocationReview);

        if (currentLocationReview) {
          setUserReview({
            content: currentLocationReview.content,
            reviewId: currentLocationReview.id,
          });
          setReviewContent(currentLocationReview.content);

          // 감성 분석 수행
          if (currentLocationReview.content) {
            setIsAnalyzing(true);
            try {
              const sentiment = await sentimentService.analyzeSentiment(
                currentLocationReview.content
              );
              console.log("감성 분석 결과:", sentiment);

              if (sentiment && sentiment.sentiments) {
                setSentimentResult(sentiment.sentiments);
                console.log("주차 감성:", sentiment.sentiments["주차"]);
                console.log("화장실 감성:", sentiment.sentiments["화장실"]);
                console.log("시설관리 감성:", sentiment.sentiments["시설관리"]);
                console.log("장소 감성:", sentiment.sentiments["장소"]);
              }
            } catch (error) {
              console.error("감성 분석 오류:", error);
            } finally {
              setIsAnalyzing(false);
            }
          }
        } else {
          setUserReview(null);
          setSentimentResult({});
        }
      } else {
        console.log(
          "사용자 리뷰 확인 건너뜀 - 인증되지 않음 또는 사용자 정보 없음"
        );
        setUserReview(null);
      }
    } catch (error) {
      console.error("리뷰 로드 오류:", error);
      console.error("오류 상세:", error.message);
    } finally {
      setLoading(false);
    }
  }, [locationId, token, isAuthenticated, user]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // 리뷰 작성/수정
  const handleSubmitReview = async () => {
    if (!reviewContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let success = false;

      if (userReview) {
        // 기존 리뷰 수정
        success = await reviewService.updateReview(
          userReview.reviewId,
          reviewContent,
          token
        );
      } else {
        // 새 리뷰 작성
        success = await reviewService.createReview(
          locationId,
          reviewContent,
          token
        );
      }

      if (success) {
        setShowReviewForm(false);
        setReviewContent("");

        // 새 리뷰 작성인 경우 즉시 사용자 리뷰 상태 업데이트
        if (!userReview) {
          setUserReview({
            content: reviewContent,
            reviewId: null, // 새로 작성된 리뷰의 ID는 서버에서 받아와야 함
          });
        } else {
          // 기존 리뷰 수정인 경우
          setUserReview({
            content: reviewContent,
            reviewId: userReview.reviewId,
          });
        }

        await loadReviews(); // 리뷰 목록 새로고침 (감성 분석 포함)
      } else {
        alert("리뷰 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("리뷰 저장 오류:", error);
      alert("리뷰 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 리뷰 삭제
  const handleDeleteReview = async () => {
    if (!userReview || !confirm("리뷰를 삭제하시겠습니까?")) return;

    try {
      const success = await reviewService.deleteReview(
        userReview.reviewId,
        token
      );
      if (success) {
        setUserReview(null);
        setReviewContent("");
        setShowReviewForm(false);
        await loadReviews(); // 리뷰 목록 새로고침
      } else {
        alert("리뷰 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("리뷰 삭제 오류:", error);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="review-section">
        <div className="review-loading">리뷰를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="review-section">
      {/* 내가 쓴 리뷰 섹션 - 로그인한 사용자에게 항상 표시 */}
      {isAuthenticated && (
        <div className="my-review-section">
          <div className="my-review-header">
            <h3 className="my-review-title">내가 쓴 리뷰</h3>
          </div>
          <div className="my-review-content">
            {/* 리뷰가 있는 경우 */}
            {userReview && userReview.content ? (
              <>
                <div className="my-review-text">{userReview.content}</div>

                {/* 수정/분석/삭제 버튼 */}
                <div className="my-review-actions">
                  <button
                    className="my-review-edit-btn"
                    onClick={() => {
                      setReviewContent(userReview.content);
                      setShowReviewForm(true);
                    }}
                  >
                    수정하기
                  </button>
                  <button
                    className="my-review-analyze-btn"
                    onClick={async () => {
                      if (userReview.content) {
                        setIsAnalyzing(true);
                        try {
                          const sentiment =
                            await sentimentService.analyzeSentiment(
                              userReview.content
                            );
                          console.log("감성 분석 결과:", sentiment);

                          if (sentiment && sentiment.sentiments) {
                            setSentimentResult(sentiment.sentiments);
                            console.log(
                              "주차 감성:",
                              sentiment.sentiments["주차"]
                            );
                            console.log(
                              "화장실 감성:",
                              sentiment.sentiments["화장실"]
                            );
                            console.log(
                              "시설관리 감성:",
                              sentiment.sentiments["시설관리"]
                            );
                            console.log(
                              "장소 감성:",
                              sentiment.sentiments["장소"]
                            );
                          }
                        } catch (error) {
                          console.error("감성 분석 오류:", error);
                          alert("감성 분석 중 오류가 발생했습니다.");
                        } finally {
                          setIsAnalyzing(false);
                        }
                      }
                    }}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "분석 중..." : "분석하기"}
                  </button>
                  <button
                    className="my-review-delete-btn"
                    onClick={async () => {
                      if (confirm("리뷰를 삭제하시겠습니까?")) {
                        try {
                          const success = await reviewService.deleteReview(
                            userReview.reviewId,
                            token
                          );
                          if (success) {
                            setUserReview(null);
                            setReviewContent("");
                            setSentimentResult({});
                            setShowReviewForm(false);
                            await loadReviews();
                          } else {
                            alert("리뷰 삭제에 실패했습니다.");
                          }
                        } catch (error) {
                          console.error("리뷰 삭제 오류:", error);
                          alert("리뷰 삭제 중 오류가 발생했습니다.");
                        }
                      }
                    }}
                  >
                    삭제하기
                  </button>
                </div>

                {/* 감성 분석 결과 */}
                {Object.keys(sentimentResult).length > 0 && (
                  <div className="sentiment-result">
                    <h4 className="sentiment-title">감성 분석 결과</h4>
                    <div className="sentiment-tags">
                      {Object.entries(sentimentResult).map(([key, value]) => (
                        <span
                          key={key}
                          className={`sentiment-tag sentiment-${value}`}
                        >
                          {key}: {translateSentiment(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 감성 분석 로딩 */}
                {isAnalyzing && (
                  <div className="sentiment-loading">감성 분석 중...</div>
                )}
              </>
            ) : (
              /* 리뷰가 없는 경우 */
              <button
                className="my-review-write-btn"
                onClick={() => setShowReviewForm(true)}
              >
                리뷰 작성하기
              </button>
            )}
          </div>
        </div>
      )}

      <div className="review-header">
        <h3 className="review-title">
          리뷰 (
          {(() => {
            const otherReviews = reviews.filter((review) => {
              if (!isAuthenticated || !user?._id) return true;
              return String(review.author) !== String(user._id);
            });
            return otherReviews.length;
          })()}
          개)
        </h3>
        {isAuthenticated && !userReview && (
          <button
            className="review-write-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            리뷰 작성
          </button>
        )}
      </div>

      {/* 리뷰 작성/수정 폼 */}
      {showReviewForm && isAuthenticated && (
        <div className="review-form">
          <textarea
            className="review-textarea"
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder={`${locationName}에 대한 리뷰를 작성해주세요.`}
            rows={4}
          />
          <div className="review-form-actions">
            <button
              className="review-cancel-btn"
              onClick={() => {
                setShowReviewForm(false);
                setReviewContent(userReview?.content || "");
              }}
            >
              취소
            </button>
            <button
              className="review-submit-btn"
              onClick={handleSubmitReview}
              disabled={!reviewContent.trim() || isSubmitting}
            >
              {isSubmitting ? "저장 중..." : userReview ? "수정" : "작성"}
            </button>
            {userReview && userReview.reviewId && (
              <button
                className="review-delete-btn"
                onClick={handleDeleteReview}
                disabled={isSubmitting}
              >
                삭제
              </button>
            )}
          </div>
        </div>
      )}

      {/* 로그인하지 않은 사용자에게 리뷰 작성 안내 */}
      {!isAuthenticated && (
        <div className="review-login-prompt">
          <p>리뷰를 작성하려면 로그인이 필요합니다.</p>
        </div>
      )}

      {/* 리뷰 목록 - 내가 쓴 리뷰 제외 */}
      <div className="review-list">
        {(() => {
          // 내가 쓴 리뷰를 제외한 리뷰들만 필터링
          console.log("전체 리뷰 목록:", reviews);
          console.log("현재 사용자 ID:", user?._id);

          const otherReviews = reviews
            .filter((review) => {
              // 로그인하지 않은 경우 모든 리뷰 표시
              if (!isAuthenticated || !user?._id) {
                return true;
              }
              // 로그인한 경우 내가 쓴 리뷰는 제외
              const isMyReview = String(review.author) === String(user._id);
              return !isMyReview;
            })
            .sort((a, b) => {
              // 최신순으로 정렬 (createdAt 또는 _id 기준)
              const dateA = a.createdAt
                ? new Date(a.createdAt)
                : new Date(a._id);
              const dateB = b.createdAt
                ? new Date(b.createdAt)
                : new Date(b._id);

              // 날짜가 유효하지 않은 경우 _id로 정렬 (MongoDB ObjectId는 시간 정보 포함)
              if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
                return b._id.localeCompare(a._id);
              }

              return dateB - dateA;
            });

          console.log("필터링된 다른 사용자 리뷰:", otherReviews);

          return otherReviews.length === 0 ? (
            <div className="review-empty">
              <p>아직 작성된 리뷰가 없습니다.</p>
              {isAuthenticated && <p>첫 번째 리뷰를 작성해보세요!</p>}
            </div>
          ) : (
            otherReviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-item-header">
                  <div className="review-item-actions">
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                    {(() => {
                      if (!isAuthenticated || !user?._id) {
                        console.log("로그인하지 않음 또는 사용자 정보 없음");
                        return false;
                      }
                      console.log("리뷰 작성자 비교:");
                      console.log("review.author:", review.author);
                      console.log("user._id:", user._id);
                      const isMyReview =
                        String(review.author) === String(user._id);
                      console.log("같은가?", isMyReview);
                      return isMyReview;
                    })() && (
                      <div className="review-edit-actions">
                        <button
                          className="review-edit-btn"
                          onClick={() => {
                            setReviewContent(review.content);
                            setUserReview({
                              content: review.content,
                              reviewId: review._id,
                            });
                            setShowReviewForm(true);
                          }}
                        >
                          수정
                        </button>
                        <button
                          className="review-delete-btn-small"
                          onClick={async () => {
                            if (confirm("리뷰를 삭제하시겠습니까?")) {
                              try {
                                const success =
                                  await reviewService.deleteReview(
                                    review._id,
                                    token
                                  );
                                if (success) {
                                  setUserReview(null);
                                  setReviewContent("");
                                  setShowReviewForm(false);
                                  await loadReviews();
                                } else {
                                  alert("리뷰 삭제에 실패했습니다.");
                                }
                              } catch (error) {
                                console.error("리뷰 삭제 오류:", error);
                                alert("리뷰 삭제 중 오류가 발생했습니다.");
                              }
                            }
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="review-content">{review.content}</div>
              </div>
            ))
          );
        })()}
      </div>
    </div>
  );
};

export default ReviewSection;
