import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import reviewService from "../services/reviewService";
import authService from "../services/authService";

const MyPage = () => {
  const { isAuthenticated, user, token } = useAuthStore();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const navigate = useNavigate();

  // 사용자 리뷰 불러오기
  const loadUserReviews = useCallback(async () => {
    if (!isAuthenticated || !user?._id || !token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reviews = await reviewService.getReviewsByUser(token, user._id);
      console.log("마이페이지에서 불러온 사용자 리뷰:", reviews);

      // 리뷰에 장소 이미지 정보 추가
      const reviewsWithImages = await Promise.all(
        reviews.map(async (review) => {
          try {
            // 장소 정보 가져오기 (이미지 포함)
            const locationResponse = await fetch(
              `http://localhost:8001/api/location/id/${review.locationId}`
            );
            if (locationResponse.ok) {
              const locationData = await locationResponse.json();
              console.log(`장소 ${review.locationId} 데이터:`, locationData);
              console.log(`이미지 필드들:`, {
                firstimage: locationData.firstimage,
                image: locationData.image,
                photo: locationData.photo,
                picture: locationData.picture,
              });
              return {
                ...review,
                locationImage:
                  locationData.firstimage ||
                  locationData.image ||
                  locationData.photo ||
                  locationData.picture ||
                  null,
                location:
                  locationData.title || locationData.name || review.location,
              };
            } else {
              console.error(
                `장소 ${review.locationId} 정보 가져오기 실패:`,
                locationResponse.status
              );
            }
          } catch (error) {
            console.error("장소 정보 가져오기 실패:", error);
          }
          return review;
        })
      );

      setUserReviews(reviewsWithImages);
    } catch (error) {
      console.error("사용자 리뷰 불러오기 오류:", error);
      setError("리뷰를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?._id, token]);

  // 로그인 상태에 따라 팝업 표시/숨김
  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginPopup(false);
    } else {
      setShowLoginPopup(true);
    }
  }, [isAuthenticated]);

  // 로그인된 경우 사용자 리뷰 로드
  useEffect(() => {
    if (isAuthenticated && user?._id && token) {
      loadUserReviews();
    }
  }, [isAuthenticated, user?._id, token, loadUserReviews]);

  // 로그인 팝업 닫기 함수
  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };

  // 취소 버튼 클릭 시 홈화면으로 이동
  const handleCancelLogin = () => {
    setShowLoginPopup(false);
    navigate("/");
  };

  // 리뷰 삭제 함수
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
      return;
    }

    setDeletingReviewId(reviewId);
    try {
      const success = await reviewService.deleteReview(reviewId, token);
      if (success) {
        // 삭제 성공 시 리뷰 목록에서 제거
        setUserReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== reviewId)
        );
        console.log("리뷰 삭제 성공");
      } else {
        console.error("리뷰 삭제 실패");
        alert("리뷰 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("리뷰 삭제 오류:", error);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  // 회원탈퇴 함수
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    setDeletingAccount(true);
    try {
      const result = await authService.deleteAccount(token);
      if (result.success) {
        // 회원탈퇴 성공 시 로그아웃 처리
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
        alert("회원탈퇴가 완료되었습니다.");
      } else {
        alert(result.error || "회원탈퇴에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원탈퇴 오류:", error);
      alert("회원탈퇴 중 오류가 발생했습니다.");
    } finally {
      setDeletingAccount(false);
      setShowDeleteAccountModal(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "white" }}>
      {/* 로그인 팝업 */}
      {showLoginPopup && !isAuthenticated && (
        <div className="login-popup-overlay">
          <div className="login-popup">
            <div className="login-popup-header">
              <h3 className="login-popup-title">로그인이 필요합니다</h3>
              <button
                className="login-popup-close"
                onClick={handleCloseLoginPopup}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="login-popup-content">
              <div className="text-4xl mb-4">🔒</div>
              <p className="login-popup-message">
                마이페이지 기능을 사용하려면 로그인해주세요.
              </p>
            </div>
            <div className="login-popup-actions">
              <button
                className="login-popup-cancel"
                onClick={handleCancelLogin}
              >
                취소
              </button>
              <Link
                to="/login"
                state={{ from: { pathname: "/mypage" } }}
                className="login-popup-login"
                onClick={handleCloseLoginPopup}
              >
                로그인하기
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="min-h-screen pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 마이페이지 콘텐츠 */}
          {isAuthenticated && (
            <>
              {/* 내가 쓴 리뷰 섹션 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* 섹션 헤더 */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-100">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        내가 쓴 리뷰
                      </h2>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={loadUserReviews}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span>새로고침</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteAccountModal(true)}
                        className="px-4 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                        disabled={deletingAccount}
                      >
                        {deletingAccount ? "처리중..." : "회원탈퇴"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 로딩 상태 */}
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-400"></div>
                    <p className="mt-3 text-gray-600 text-sm">
                      리뷰를 불러오는 중...
                    </p>
                  </div>
                )}

                {/* 에러 상태 */}
                {error && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-red-500 mb-4 text-sm">{error}</p>
                    <button
                      onClick={loadUserReviews}
                      className="px-4 py-2 bg-red-200 text-red-700 rounded-lg hover:bg-red-300 transition-colors text-sm font-medium"
                    >
                      다시 시도
                    </button>
                  </div>
                )}

                {/* 리뷰 목록 */}
                {!loading && !error && (
                  <>
                    {userReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <svg
                            className="w-8 h-8 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-3">
                          아직 작성한 리뷰가 없습니다
                        </h3>
                        <p className="text-gray-600 mb-6 text-base">
                          장소를 방문하고 첫 번째 리뷰를 작성해보세요!
                        </p>
                        <Link
                          to="/search"
                          className="inline-flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          장소 찾아보기
                        </Link>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
                        {userReviews.map((review) => (
                          <div
                            key={review.id}
                            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-green-200 transition-all duration-300 group"
                          >
                            {/* 상단: 사진, 리뷰, 삭제 버튼 */}
                            <div className="flex items-start space-x-4 mb-3">
                              {/* 사진 */}
                              <Link
                                to={`/location/${review.locationId}`}
                                className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 shadow-sm"
                              >
                                {review.locationImage ? (
                                  <img
                                    src={review.locationImage}
                                    alt={review.location || "장소 이미지"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.error(
                                        "이미지 로딩 실패:",
                                        review.locationImage
                                      );
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 ${
                                    review.locationImage ? "hidden" : "flex"
                                  }`}
                                >
                                  <svg
                                    className="w-10 h-10 text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                </div>
                              </Link>

                              {/* 리뷰 내용 */}
                              <div className="flex-1 min-w-0">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-3 border border-gray-100">
                                  <p className="text-gray-800 leading-relaxed line-clamp-3 text-sm font-medium">
                                    {review.content}
                                  </p>
                                </div>

                                {/* 분석 결과 */}
                                {review.sentiment && (
                                  <div className="mb-3">
                                    <div className="flex items-center space-x-3">
                                      <span
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                                          review.sentiment === "positive"
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : review.sentiment === "negative"
                                            ? "bg-red-100 text-red-700 border border-red-200"
                                            : "bg-gray-100 text-gray-700 border border-gray-200"
                                        }`}
                                      >
                                        {review.sentiment === "positive"
                                          ? "😊 긍정적"
                                          : review.sentiment === "negative"
                                          ? "😔 부정적"
                                          : "😐 중립적"}
                                      </span>
                                      {review.sentimentScore && (
                                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200">
                                          신뢰도:{" "}
                                          {Math.round(
                                            review.sentimentScore * 100
                                          )}
                                          %
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* 작성일 */}
                                <div className="flex items-center text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200 w-fit">
                                  <svg
                                    className="w-3 h-3 mr-2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  {new Date(
                                    review.createdAt || review.id
                                  ).toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </div>
                              </div>

                              {/* 삭제 버튼 */}
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                disabled={deletingReviewId === review.id}
                                className="flex-shrink-0 p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/delete"
                              >
                                {deletingReviewId === review.id ? (
                                  <div className="w-5 h-5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"></div>
                                ) : (
                                  <svg
                                    className="w-5 h-5 group-hover/delete:scale-110 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>

                            {/* 하단: 장소명 */}
                            <Link
                              to={`/location/${review.locationId}`}
                              className="block text-lg font-bold text-gray-800 hover:text-green-600 transition-colors group-hover:translate-x-1 transform duration-200"
                            >
                              {review.location || "장소 정보 없음"}
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* 로그인 팝업 */}
          {/* {showLoginPopup && !isAuthenticated && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                로그인이 필요합니다
              </h3>
              <p className="text-gray-500 mb-8">
                마이페이지 기능을 사용하려면 로그인해주세요.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleCancelLogin} className="btn-outline">
                  취소
                </button>
                <Link to="/login" className="btn-primary">
                  로그인하기
                </Link>
              </div>
            </div>
          )} */}

          {/* 회원탈퇴 모달 */}
          {showDeleteAccountModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    회원탈퇴 확인
                  </h3>
                  <p className="text-gray-600 mb-6">
                    정말로 회원탈퇴를 하시겠습니까?
                    <br />이 작업은 되돌릴 수 없으며, 모든 데이터가 삭제됩니다.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDeleteAccountModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={deletingAccount}
                    >
                      취소
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={deletingAccount}
                    >
                      {deletingAccount ? "처리중..." : "탈퇴하기"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyPage;
