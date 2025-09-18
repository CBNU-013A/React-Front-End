import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchResultCard from "../components/SearchResultCard";
import LoginModal from "../components/LoginModal";
import useAuthStore from "../stores/authStore";
import useLikeStore from "../stores/likeStore";
import { getRandomLocations } from "../services/randomLocationService";

const DiscoverPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { likedPlaces, toggleLike, loadLikedPlaces } = useLikeStore();
  const [randomLocations, setRandomLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 랜덤 장소 로드
  const loadRandomLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const locations = await getRandomLocations();
      setRandomLocations(locations);
    } catch (err) {
      console.error("랜덤 장소 로드 실패:", err);
      setError("장소를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 랜덤 장소 로드
  useEffect(() => {
    loadRandomLocations();
  }, []);

  // 로그인 상태에 따라 좋아요 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadLikedPlaces();
    }
  }, [isAuthenticated, loadLikedPlaces]);

  // 좋아요 토글 처리
  const handleToggleLike = async (location) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      console.log("DiscoverPage 좋아요 토글:", location._id);
      await toggleLike(location._id);
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "white" }}
    >
      {/* 메인 콘텐츠 */}
      <main>
        <div className="container mx-auto px-4 py-2 sm:py-4 lg:py-6">
          {/* 페이지 헤더 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                새로운 장소를 발견해보세요
              </h1>
              {/* 새로고침 버튼 - 제목 옆 */}
              <button
                onClick={loadRandomLocations}
                className="px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-green-200 bg-white shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                ) : (
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
                )}
              </button>
            </div>
            <p className="text-gray-600 text-lg">
              마음에 드는 장소를 찾아서 좋아요를 눌러보세요!
            </p>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="text-center py-16">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-spinner-text">
                  장소를 불러오는 중...
                </div>
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                오류가 발생했습니다
              </h3>
              <p className="text-gray-500 mb-8">{error}</p>
              <button onClick={loadRandomLocations} className="btn-primary">
                다시 시도
              </button>
            </div>
          )}

          {/* 장소 목록 */}
          {!loading && !error && (
            <>
              {randomLocations.length === 0 ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="text-center">
                    <div className="text-6xl mb-6">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">
                      장소를 찾을 수 없습니다
                    </h3>
                    <p className="text-gray-500 mb-8">
                      잠시 후 다시 시도해주세요.
                    </p>
                    <button
                      onClick={loadRandomLocations}
                      className="btn-primary"
                    >
                      새로고침
                    </button>
                  </div>
                </div>
              ) : (
                <div className="search-results-grid">
                  {randomLocations.map((location) => {
                    const isLiked = likedPlaces.some(
                      (liked) => liked._id === location._id
                    );
                    return (
                      <SearchResultCard
                        key={location._id}
                        location={location}
                        isLiked={isLiked}
                        onToggleLike={() => handleToggleLike(location)}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="로그인이 필요합니다"
        message="좋아요 기능을 사용하려면 로그인해주세요."
      />
    </div>
  );
};

export default DiscoverPage;
