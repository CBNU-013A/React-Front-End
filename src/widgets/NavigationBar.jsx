import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo.svg";
import useAuthStore from "../stores/authStore";

const NavigationBar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="flex items-center justify-between h-10 sm:h-12 lg:h-14">
          {/* 로고 */}
          <div className="navbar-logo" style={{ marginLeft: "3rem" }} z>
            <Link to="/" className="navbar-logo">
              <div className="navbar-logo-icon">
                <img
                  src={Logo}
                  alt="Pik Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
          </div>

          {/* 중앙 네비게이션 메뉴 */}
          <div className="navbar-nav-center">
            <Link
              to="/recommendations"
              className="navbar-auth-btn hover:text-green-600"
            >
              여행 추천받으러가기
            </Link>
            <Link to="/search" className="navbar-auth-btn hover:text-green-600">
              검색
            </Link>
            <Link
              to="/favorites"
              className="navbar-auth-btn hover:text-green-600"
            >
              즐겨찾기
            </Link>
            <Link to="/mypage" className="navbar-auth-btn hover:text-green-600">
              마이페이지
            </Link>
          </div>

          {/* 인증 버튼들 */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 mr-4">
                  안녕하세요, {user?.name || user?.email}님
                </span>
                <button
                  onClick={handleLogout}
                  className="navbar-auth-btn bg-red-500 text-white hover:bg-red-600"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-auth-btn navbar-login-btn">
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="navbar-auth-btn bg-green-500 text-white hover:bg-green-600"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden p-2 ml-4"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/recommendations"
                className="navbar-auth-btn hover:text-green-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                여행 추천받으러가기
              </Link>
              <Link
                to="/search"
                className="navbar-auth-btn hover:text-green-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                검색
              </Link>
              <Link
                to="/favorites"
                className="navbar-auth-btn hover:text-green-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                즐겨찾기
              </Link>
              <Link
                to="/mypage"
                className="navbar-auth-btn hover:text-green-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                마이페이지
              </Link>

              {/* 모바일 인증 버튼들 */}
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    안녕하세요, {user?.name || user?.email}님
                  </span>
                  <button
                    onClick={handleLogout}
                    className="navbar-auth-btn bg-red-500 text-white hover:bg-red-600 text-left"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="navbar-auth-btn navbar-login-btn"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    className="navbar-auth-btn bg-green-500 text-white hover:bg-green-600 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
