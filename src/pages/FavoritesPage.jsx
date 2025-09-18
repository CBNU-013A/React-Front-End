import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchResultCard from "../components/SearchResultCard";
import useAuthStore from "../stores/authStore";
import useLikeStore from "../stores/likeStore";
import { locationService } from "../services/locationService";

const FavoritesPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { likedPlaces, loadLikedPlaces, loading, error, toggleLike } =
    useLikeStore();
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [serverConnectionError, setServerConnectionError] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();

  // 좋아요한 장소들의 상세 정보 로드
  useEffect(() => {
    const loadFavoriteDetails = async () => {
      if (!likedPlaces || likedPlaces.length === 0) {
        setFavoriteLocations([]);
        setServerConnectionError(false);
        navigate("/discover");
        return;
      }

      try {
        setLoadingDetails(true);
        setServerConnectionError(false);
        const locationDetails = [];

        for (const likedPlace of likedPlaces) {
          try {
            // likedPlace가 ObjectId 문자열인 경우와 객체인 경우 모두 처리
            const placeId =
              typeof likedPlace === "string" ? likedPlace : likedPlace._id;
            console.log(`Loading location details for placeId: ${placeId}`);

            const locationDetail = await locationService.fetchLocation(placeId);
            locationDetails.push(locationDetail);
          } catch (error) {
            console.error(`Failed to load location ${likedPlace}:`, error);
            // 네트워크 에러나 서버 연결 실패인 경우
            if (
              error.message.includes("Failed to fetch") ||
              error.message.includes("NetworkError") ||
              error.message.includes("fetch") ||
              error.message.includes("404") ||
              error.message.includes("Cannot GET")
            ) {
              setServerConnectionError(true);
              return;
            }
          }
        }

        setFavoriteLocations(locationDetails);
      } catch (error) {
        console.error("Failed to load favorite details:", error);
        setServerConnectionError(true);
      } finally {
        setLoadingDetails(false);
      }
    };

    if (isAuthenticated && likedPlaces) {
      loadFavoriteDetails();
    }
  }, [isAuthenticated, likedPlaces, navigate]);

  // 좋아요한 장소 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadLikedPlaces();
    }
  }, [isAuthenticated, loadLikedPlaces]);

  // 좋아요 토글 처리
  const handleToggleLike = async (location) => {
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }

    try {
      await toggleLike(location._id, location.title);
      // 좋아요 상태가 변경되면 즐겨찾기 목록에서 해당 장소 제거
      setFavoriteLocations((prev) =>
        prev.filter((loc) => loc._id !== location._id)
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // 로그인 팝업 닫기
  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };

  // 로그인 취소
  const handleCancelLogin = () => {
    setShowLoginPopup(false);
    // 취소 시 홈페이지로 이동
    navigate("/");
  };

  // 로그인하지 않은 경우 로그인 팝업 표시
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginPopup(true);
    }
  }, [isAuthenticated]);

  // 서버 연결 오류
  if (serverConnectionError) {
    return (
      <div className="min-h-screen bg-white">
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="text-red-600 font-medium mb-2">
                  서버 연결 오류
                </div>
                <div className="text-red-500 text-sm">
                  서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                다시 시도
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 로딩 중
  if (loading || loadingDetails) {
    return (
      <div className="min-h-screen bg-white">
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-spinner-text">
                  {loading
                    ? "좋아요 목록을 불러오는 중..."
                    : "즐겨찾기 장소 정보를 불러오는 중..."}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="text-red-600 font-medium mb-2">오류 발생</div>
                <div className="text-red-500 text-sm">{error}</div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                다시 시도
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "white" }}
    >
      {/* 메인 콘텐츠 */}
      <main>
        <div className="container mx-auto px-4 py-2 sm:py-4 lg:py-6">
          {/* 즐겨찾기 목록 */}
          {favoriteLocations.length === 0 && likedPlaces.length > 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <div className="loading-spinner-text">
                    즐겨찾기 장소 정보를 불러오는 중...
                  </div>
                </div>
              </div>
            </div>
          ) : favoriteLocations.length > 0 ? (
            <>
              {/* 페이지 헤더와 Discover 버튼 */}
              <div className="flex flex-wrap items-center justify-center mb-6 gap-3">
                <p className="text-gray-600 text-base text-center">
                  좋아요를 누른 장소들을 확인해보세요
                </p>
                <button
                  onClick={() => navigate("/discover")}
                  className="btn-primary px-3 py-1 text-sm"
                >
                  더 많은 장소 찾아보기
                </button>
              </div>

              <div className="search-results-grid">
                {favoriteLocations.map((location) => {
                  const isLiked = likedPlaces.some(
                    (liked) => liked._id === location._id
                  );
                  return (
                    <SearchResultCard
                      key={location._id}
                      location={location}
                      isLiked={isLiked}
                      onToggleLike={() => handleToggleLike(location)}
                      showCount={true}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <div className="loading-spinner-text">
                    즐겨찾기 장소 정보를 불러오는 중...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

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
                즐겨찾기 기능을 사용하려면 로그인해주세요.
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
                state={{ from: { pathname: "/favorites" } }}
                className="login-popup-login"
                onClick={handleCloseLoginPopup}
              >
                로그인하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
