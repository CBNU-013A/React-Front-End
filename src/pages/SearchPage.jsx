import React, { useState, useEffect, useCallback } from "react";
import NavigationBar from "../widgets/NavigationBar";
import SearchResultCard from "../components/SearchResultCard";
import RecentSearchList from "../components/RecentSearchList";
import {
  locationService,
  recentSearchService,
} from "../services/locationService";
import useAuthStore from "../stores/authStore";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRecentSearches, setShowRecentSearches] = useState(true);

  const { user, isAuthenticated } = useAuthStore();

  // 최근 검색 기록 로드
  const loadRecentSearches = useCallback(async () => {
    if (!isAuthenticated || !user?.userId) return;

    try {
      const recent = await recentSearchService.fetchRecentSearch(user.userId);
      setRecentSearches(recent);
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
  }, [isAuthenticated, user?.userId]);

  // 컴포넌트 마운트 시 sessionStorage 초기화 및 최근 검색 기록 로드
  useEffect(() => {
    // 새로고침 시 검색창 내용 초기화
    sessionStorage.removeItem("searchQuery");
    sessionStorage.removeItem("searchResults");

    loadRecentSearches();

    // 컴포넌트 언마운트 시 sessionStorage 초기화 (다른 페이지로 이동 시)
    return () => {
      sessionStorage.removeItem("searchQuery");
      sessionStorage.removeItem("searchResults");
    };
  }, [loadRecentSearches]);

  // 컴포넌트 마운트 시 저장된 검색어 실행 로직 제거 (새로고침 시 초기화)

  // 검색 실행
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowRecentSearches(true);
      sessionStorage.removeItem("searchResults");
      return;
    }

    setLoading(true);
    setError(null);
    setShowRecentSearches(false);

    try {
      const results = await locationService.searchLocations(query);
      setSearchResults(results);
      // 검색 결과를 sessionStorage에 저장
      sessionStorage.setItem("searchResults", JSON.stringify(results));
    } catch (error) {
      console.error("Search failed:", error);
      setError("검색 중 오류가 발생했습니다.");
      setSearchResults([]);
      // 에러 시 검색 결과 제거
      sessionStorage.removeItem("searchResults");
    } finally {
      setLoading(false);
    }
  };

  // 검색 입력 핸들러
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // sessionStorage에 검색어 저장
    if (query.trim()) {
      sessionStorage.setItem("searchQuery", query);
    } else {
      sessionStorage.removeItem("searchQuery");
      sessionStorage.removeItem("searchResults");
    }

    // 디바운싱을 위한 타이머
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  // 검색 초기화 핸들러
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
    setShowRecentSearches(true);
    clearTimeout(window.searchTimeout);
    sessionStorage.removeItem("searchQuery");
    sessionStorage.removeItem("searchResults");
  };

  // 장소 클릭 핸들러
  const handleLocationClick = async (location) => {
    // 로그인된 사용자만 최근 검색에 추가
    if (isAuthenticated && user?.userId) {
      try {
        await recentSearchService.addRecentSearch(user.userId, location);
        // 최근 검색 기록 새로고침
        loadRecentSearches();
      } catch (error) {
        console.error("Failed to add recent search:", error);
      }
    }

    // TODO: 장소 상세 페이지로 이동
    console.log("Navigate to location detail:", location);
  };

  // 최근 검색 삭제
  const handleDeleteRecentSearch = async (locationId) => {
    if (!isAuthenticated || !user?.userId) return;

    try {
      const success = await recentSearchService.deleteRecentSearch(
        user.userId,
        locationId
      );
      if (success) {
        setRecentSearches((prev) =>
          prev.filter((item) => item._id !== locationId)
        );
      }
    } catch (error) {
      console.error("Failed to delete recent search:", error);
    }
  };

  // 최근 검색 전체 삭제
  const handleClearAllRecentSearches = async () => {
    if (!isAuthenticated || !user?.userId) return;

    if (window.confirm("모든 최근 검색 기록을 삭제하시겠습니까?")) {
      try {
        const success = await recentSearchService.resetRecentSearch(
          user.userId
        );
        if (success) {
          setRecentSearches([]);
        }
      } catch (error) {
        console.error("Failed to clear recent searches:", error);
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <NavigationBar />

      <main style={{ paddingTop: "5rem" }}>
        <div className="container mx-auto px-4 py-8 max-w-full">
          {/* 검색 입력 */}
          <div className="search-input-container">
            <div className="search-input-wrapper">
              <svg
                className="search-input-icon"
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
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="여행지 이름을 입력하세요..."
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="search-clear-btn"
                  type="button"
                >
                  <svg
                    className="w-5 h-5"
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
              )}
            </div>
          </div>

          {/* 검색 결과 또는 최근 검색 기록 */}
          <div className="search-content">
            {showRecentSearches ? (
              // 최근 검색 기록 표시
              <RecentSearchList
                recentSearches={recentSearches}
                onDeleteSearch={handleDeleteRecentSearch}
                onClearAll={handleClearAllRecentSearches}
              />
            ) : (
              // 검색 결과 표시
              <div className="search-results">
                {loading ? (
                  <div className="search-loading-content">
                    <div className="search-loading-spinner"></div>
                    <p className="search-loading-text">불러오는 중...</p>
                  </div>
                ) : error ? (
                  <div className="search-error">
                    <p className="search-error-text">{error}</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="search-results-header">
                      <h2 className="search-results-title">
                        검색 결과 ({searchResults.length}개)
                      </h2>
                    </div>
                    <div className="search-results-grid">
                      {searchResults.map((location) => (
                        <SearchResultCard
                          key={location._id}
                          location={location}
                          onLocationClick={handleLocationClick}
                        />
                      ))}
                    </div>
                  </>
                ) : searchQuery.trim() ? (
                  <div className="search-no-results">
                    <div className="search-no-results-icon"></div>
                    <p className="search-no-results-text">
                      "{searchQuery}"에 대한 검색 결과가 없습니다.
                    </p>
                    <p className="search-no-results-subtext">
                      다른 키워드로 검색해보세요.
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
