import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import ErrorBoundary from "./components/ErrorBoundary";
import NavigationBar from "./widgets/NavigationBar";

// Stores
import useAuthStore from "./stores/authStore";
import useLikeStore from "./stores/likeStore";

// Pages
import HomePage from "./pages/HomePage";
import RecommendationsPage from "./pages/RecommendationsPage";
import SearchPage from "./pages/SearchPage";
import FavoritesPage from "./pages/FavoritesPage";
import MyPage from "./pages/MyPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LocationDetailPage from "./pages/LocationDetailPage";
import DiscoverPage from "./pages/DiscoverPage";

// Recommendation Pages
import SetLocationPage from "./pages/recommendation/SetLocationPage";
import ResultPage from "./pages/recommendation/ResultPage";

function App() {
  const { isAuthenticated, initialize } = useAuthStore();
  const { loadLikedPlaces } = useLikeStore();

  // 앱 시작 시 인증 상태 초기화
  useEffect(() => {
    console.log("🚀 App 컴포넌트 마운트, 인증 상태 초기화 시작");
    // initialize();
  }, [initialize]);

  // 인증 상태가 변경될 때마다 좋아요 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadLikedPlaces();
    }
  }, [isAuthenticated, loadLikedPlaces]);

  return (
    <ErrorBoundary>
      <Router>
        <div
          className="App"
          style={{ backgroundColor: "white", minHeight: "100vh" }}
        >
          {/* 고정 헤더 */}
          <header className="fixed top-0 left-0 right-0 z-50">
            <NavigationBar />
          </header>

          {/* 메인 콘텐츠 영역 */}
          <main style={{ paddingTop: "80px", paddingBottom: "5rem" }}>
            <Routes>
              {/* 홈페이지 */}
              <Route path="/" element={<HomePage />} />

              {/* 네비게이션 메뉴 라우트들 */}
              <Route
                path="/recommendations"
                element={<RecommendationsPage />}
              />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/discover" element={<DiscoverPage />} />

              {/* 추천 플로우 라우트들 */}
              <Route
                path="/recommendation/location"
                element={<SetLocationPage />}
              />
              <Route path="/recommendation/result" element={<ResultPage />} />

              {/* 인증 페이지 라우트들 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* 장소 상세 페이지 */}
              <Route path="/location/:id" element={<LocationDetailPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
