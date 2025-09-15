import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigationBar from "../widgets/NavigationBar";
import SearchResultCard from "../components/SearchResultCard";
import useAuthStore from "../stores/authStore";
import useLikeStore from "../stores/likeStore";
import { locationService } from "../services/locationService";

const FavoritesPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { likedPlaces, loadLikedPlaces, loading, error } = useLikeStore();
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();

  // 좋아요한 장소들의 상세 정보 로드
  useEffect(() => {
    const loadFavoriteDetails = async () => {
      if (!likedPlaces || likedPlaces.length === 0) {
        setFavoriteLocations([]);
        return;
      }

      try {
        setLoadingDetails(true);
        const locationDetails = [];

        for (const likedPlace of likedPlaces) {
          try {
            const locationDetail = await locationService.fetchLocation(
              likedPlace._id
            );
            locationDetails.push(locationDetail);
          } catch (error) {
            console.error(`Failed to load location ${likedPlace._id}:`, error);
            // 실패한 장소는 제외하고 계속 진행
          }
        }

        setFavoriteLocations(locationDetails);
      } catch (error) {
        console.error("Failed to load favorite locations:", error);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadFavoriteDetails();
  }, [likedPlaces]);

  // 좋아요 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadLikedPlaces();
      setShowLoginPopup(false); // 로그인되면 팝업 닫기
    } else {
      setShowLoginPopup(true); // 로그인되지 않으면 팝업 표시
    }
  }, [isAuthenticated, loadLikedPlaces]);

  // 로그인 팝업 닫기 함수
  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };

  // 취소 버튼 클릭 시 홈화면으로 이동
  const handleCancelLogin = () => {
    setShowLoginPopup(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <NavigationBar />

      {/* 메인 콘텐츠 - 네비게이션바 높이만큼 상단 여백 추가 */}
      <main style={{ paddingTop: "4.5rem", paddingBottom: "5rem" }}>
        <div className="navbar-container py-4 sm:py-8 lg:py-12">
          {/* 로딩 상태 */}
          {(loading || loadingDetails) && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={loadLikedPlaces} className="btn-primary">
                다시 시도
              </button>
            </div>
          )}

          {/* 즐겨찾기 목록 */}
          {!loading && !loadingDetails && !error && (
            <>
              {!isAuthenticated ? (
                <div className="text-center py-12"></div>
              ) : favoriteLocations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💝</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    아직 즐겨찾기한 장소가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-6">
                    마음에 드는 장소를 찾아서 좋아요를 눌러보세요!
                  </p>
                  <Link to="/search" className="btn-primary">
                    장소 찾아보기
                  </Link>
                </div>
              ) : (
                <div className="search-results-grid">
                  {favoriteLocations.map((location) => (
                    <SearchResultCard
                      key={location._id}
                      location={location}
                      onLocationClick={() => {}} // 즐겨찾기에서는 클릭 핸들러 불필요
                      showCount={false} // 즐겨찾기에서는 좋아요 개수 표시 안함
                    />
                  ))}
                </div>
              )}
            </>
          )}

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
      </main>
    </div>
  );
};

export default FavoritesPage;
