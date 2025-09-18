import React, { useState, useEffect, useCallback } from "react";
import useAuthStore from "../stores/authStore";
import reviewService from "../services/reviewService";

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

  // 리뷰 데이터 로드 (리팩토링: getSplitReviewsByLocation 사용)
  const loadReviews = useCallback(async () => {
    try {
      setUserReview(null);
      setSentimentResult({});
      setLoading(true);

      // 새로운 API 사용: 내 리뷰와 다른 리뷰를 한 번에 받아옴
      const { mine, others } = await reviewService.getSplitReviewsByLocation(
        locationId,
        token || null,
        user?._id || null
      );

      setReviews(others || []);
      if (mine) {
        setUserReview({
          content: mine.content,
          reviewId: mine.id || mine._id,
          sentimentAspects: mine.sentimentAspects || [],
        });
        setReviewContent(mine.content);
        // 감성 분석 결과가 있다면 변환하여 상태에 저장
        if (mine.sentimentAspects && mine.sentimentAspects.length > 0) {
          const sentimentMap = {};
          mine.sentimentAspects.forEach((aspect) => {
            if (aspect.sentiment) {
              // 가장 높은 점수를 가진 감성을 찾기
              const sentimentValues = aspect.sentiment;
              let dominantSentiment = "none";
              let maxCount = 0;
              Object.entries(sentimentValues).forEach(([key, value]) => {
                if (value > maxCount) {
                  maxCount = value;
                  dominantSentiment = key;
                }
              });
              sentimentMap[aspect.aspect] = dominantSentiment;
            }
          });
          setSentimentResult(sentimentMap);
        }
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
                          console.log("=== 감성 분석 요청 ===");
                          console.log("분석할 리뷰 내용:", userReview.content);
                          console.log("사용자 인증 상태:", isAuthenticated);
                          console.log("사용자 정보:", user);
                          console.log("토큰 존재 여부:", !!token);
                          console.log("토큰 타입:", typeof token);
                          console.log("토큰 길이:", token ? token.length : 0);
                          console.log(
                            "토큰 앞 20자:",
                            token ? token.substring(0, 20) + "..." : "토큰 없음"
                          );

                          const sentiment =
                            await reviewService.analyzeSentiment(
                              userReview.content,
                              token, // 토큰 전달
                              locationId // 현재 장소 ID 전달
                            );
                          console.log("=== 감성 분석 결과 ===");
                          console.log("전체 결과:", sentiment);
                          console.log("결과 타입:", typeof sentiment);
                          console.log(
                            "결과 키들:",
                            sentiment ? Object.keys(sentiment) : "결과 없음"
                          );

                          if (sentiment && sentiment.success) {
                            // sentiments 데이터 확인
                            const sentimentsData =
                              sentiment.sentiments || sentiment.rawSentiments;

                            if (
                              sentimentsData &&
                              Object.keys(sentimentsData).length > 0
                            ) {
                              console.log(
                                "분석된 감성 데이터:",
                                sentimentsData
                              );
                              console.log(
                                "감성 데이터 키들:",
                                Object.keys(sentimentsData)
                              );
                              console.log(
                                "감성 데이터 값들:",
                                Object.values(sentimentsData)
                              );

                              // UI에 분석 결과 표시
                              setSentimentResult(sentimentsData);
                              console.log("UI에 분석 결과 설정 완료");

                              // 각 필드별 감성 분석 결과 출력
                              Object.keys(sentimentsData).forEach((field) => {
                                const fieldData = sentimentsData[field];
                                console.log(`${field} 감성 분석:`, fieldData);
                              });

                              // 요약 정보 출력
                              if (sentiment.summary) {
                                console.log("분석 요약:", sentiment.summary);
                              }
                            } else {
                              console.log(
                                "분석 결과에 sentiments 데이터가 없습니다."
                              );
                              console.log("sentiment 객체:", sentiment);
                            }
                          } else {
                            console.log("분석이 실패했습니다:", sentiment);
                          }
                        } catch (error) {
                          console.error("감성 분석 오류:", error);

                          // 에러 메시지 개선
                          let errorMessage =
                            "감성 분석 중 오류가 발생했습니다.";
                          if (error.message && error.message.includes("401")) {
                            errorMessage =
                              "인증이 필요합니다. 다시 로그인해주세요.";
                          } else if (
                            error.message &&
                            error.message.includes("토큰")
                          ) {
                            errorMessage =
                              "토큰이 필요합니다. 다시 로그인해주세요.";
                          }

                          alert(errorMessage);
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

                {/* 상세 감성 분석 결과 (API에서 받은 sentimentAspects) */}
                {userReview &&
                  userReview.sentimentAspects &&
                  userReview.sentimentAspects.length > 0 && (
                    <div className="sentiment-result">
                      <h4 className="sentiment-title">상세 감성 분석 결과</h4>
                      <div className="sentiment-aspects">
                        {userReview.sentimentAspects.map((aspect, index) => (
                          <div key={index} className="sentiment-aspect">
                            <div className="aspect-header">
                              <span className="aspect-name">
                                분야 {index + 1}
                              </span>
                              {aspect.sentiment && (
                                <div className="sentiment-scores">
                                  {Object.entries(aspect.sentiment).map(
                                    ([sentiment, count]) => (
                                      <span
                                        key={sentiment}
                                        className={`sentiment-score sentiment-${sentiment}`}
                                      >
                                        {translateSentiment(sentiment)}: {count}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
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
              /* 리뷰가 없는 경우 - 버튼 제거하고 텍스트만 표시 */
              <p className="text-gray-600 text-sm">
                아직 작성한 리뷰가 없습니다.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="review-header">
        <h3 className="review-title">
          리뷰 (
          {(() => {
            // 다른 리뷰들 (userReview가 아닌 것들)
            const otherReviews = reviews;
            return otherReviews.length;
          })()}
          개)
        </h3>
        {isAuthenticated && (
          <button
            className="review-write-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            {userReview ? "리뷰 수정하기" : "리뷰 작성하기"}
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

          // userReview는 이미 별도로 표시되므로, reviews 배열의 모든 리뷰를 표시
          const otherReviews = reviews.sort((a, b) => {
            // 최신순으로 정렬 (createdAt 또는 _id 기준)
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a._id);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b._id);

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
                    {/* 다른 사용자의 리뷰는 수정/삭제 불가 */}
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
