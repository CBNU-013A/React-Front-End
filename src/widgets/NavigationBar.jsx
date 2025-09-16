import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.svg";
import useAuthStore from "../stores/authStore";

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  // 디버깅용 로그
  console.log("🧭 NavigationBar 렌더링:", { isAuthenticated, user });

  const navigationItems = [
    { name: "여행지 추천받기", path: "/recommendations" },
    { name: "검색", path: "/search" },
    { name: "즐겨찾기", path: "/favorites" },
    { name: "마이페이지", path: "/mypage" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleRecommendationClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/recommendations");
    } else {
      // 로그인된 경우 바로 추천 시작
      navigate("/recommendation/with");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* 로고 */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <img
                src={Logo}
                alt="Pik Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* 데스크톱 네비게이션 - 가운데 정렬 */}
          <div className="navbar-nav-center">
            {navigationItems.map((item) => {
              if (item.name === "여행지 추천받기") {
                return (
                  <button
                    key={item.name}
                    onClick={handleRecommendationClick}
                    className={`navbar-nav-item ${
                      isActive(item.path) ? "active" : ""
                    }`}
                  >
                    <span className="text-sm lg:text-base">{item.name}</span>
                  </button>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`navbar-nav-item ${
                    isActive(item.path) ? "active" : ""
                  }`}
                >
                  <span className="text-sm lg:text-base">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* 인증 버튼 */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              // 로그인된 상태
              <>
                <span className="text-sm lg:text-base text-gray-700 flex items-center">
                  안녕하세요, {user?.userName}님
                </span>
                <button
                  className="navbar-auth-btn navbar-login-btn"
                  onClick={() => {
                    if (window.confirm("정말 로그아웃 하시겠습니까?")) {
                      logout();
                    }
                  }}
                >
                  <span className="text-sm lg:text-base">로그아웃</span>
                </button>
              </>
            ) : (
              // 로그인되지 않은 상태
              <>
                <Link
                  to="/login"
                  state={{ from: { pathname: location.pathname } }}
                  className="navbar-auth-btn navbar-login-btn"
                >
                  <span className="text-sm lg:text-base">로그인</span>
                </Link>
                <Link
                  to="/signup"
                  className="navbar-auth-btn navbar-signup-btn"
                >
                  <span className="text-sm lg:text-base">회원가입</span>
                </Link>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{
              color: "#3C7157",
              backgroundColor: isMenuOpen ? "#EDF7F2" : "transparent",
              border: "1px solid #E5E7EB",
            }}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div
            className="lg:hidden absolute top-full left-0 right-0 z-40"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderBottom: "1px solid #E5E7EB",
              boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="px-3 sm:px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                if (item.name === "여행지 추천받기") {
                  return (
                    <Link
                      key={item.name}
                      to="/recommendations"
                      className={`flex items-center px-3 sm:px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActive(item.path)
                          ? "active"
                          : "navbar-nav-item hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-sm sm:text-base">{item.name}</span>
                    </Link>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-3 sm:px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive(item.path)
                        ? "active"
                        : "navbar-nav-item hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-sm sm:text-base">{item.name}</span>
                  </Link>
                );
              })}

              {/* 모바일 인증 버튼 */}
              <div className="pt-2 border-t border-gray-200 space-y-2">
                {isAuthenticated ? (
                  // 로그인된 상태
                  <>
                    <div className="px-3 sm:px-4 py-2.5 text-center">
                      <span className="text-sm text-gray-700">
                        안녕하세요, {user?.userName}님
                      </span>
                    </div>
                    <button
                      className="w-full flex items-center justify-center px-3 sm:px-4 py-3 rounded-lg font-medium transition-colors navbar-auth-btn navbar-login-btn"
                      onClick={() => {
                        if (window.confirm("정말 로그아웃 하시겠습니까?")) {
                          logout();
                          setIsMenuOpen(false);
                        }
                      }}
                    >
                      <span className="text-sm sm:text-base">로그아웃</span>
                    </button>
                  </>
                ) : (
                  // 로그인되지 않은 상태
                  <>
                    <Link
                      to="/login"
                      state={{ from: { pathname: location.pathname } }}
                      className="w-full flex items-center justify-center px-3 sm:px-4 py-3 rounded-lg font-medium transition-colors navbar-auth-btn navbar-login-btn"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-sm sm:text-base">로그인</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="w-full flex items-center justify-center px-3 sm:px-4 py-3 rounded-lg font-medium transition-colors navbar-auth-btn navbar-signup-btn"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-sm sm:text-base">회원가입</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
