import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import ErrorBoundary from "./components/ErrorBoundary";

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

function App() {
  const { initialize } = useAuthStore();
  const { loadLikedPlaces } = useLikeStore();

  // 앱 시작 시 인증 상태 초기화
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 인증 상태가 변경될 때마다 좋아요 목록 로드
  useEffect(() => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      loadLikedPlaces();
    }
  }, [loadLikedPlaces]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            {/* 홈페이지 */}
            <Route path="/" element={<HomePage />} />

            {/* 네비게이션 메뉴 라우트들 */}
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/mypage" element={<MyPage />} />

            {/* 인증 페이지 라우트들 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* 장소 상세 페이지 */}
            <Route path="/location/:id" element={<LocationDetailPage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
