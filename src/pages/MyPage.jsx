import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigationBar from "../widgets/NavigationBar";
import useAuthStore from "../stores/authStore";

const MyPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();

  // 로그인 상태에 따라 팝업 표시/숨김
  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginPopup(false); // 로그인되면 팝업 닫기
    } else {
      setShowLoginPopup(true); // 로그인되지 않으면 팝업 표시
    }
  }, [isAuthenticated]);

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
      <main style={{ paddingTop: "4.5rem" }}>
        <div className="navbar-container py-4 sm:py-8 lg:py-12">
          {/* 마이페이지 콘텐츠 */}
          {!isAuthenticated ? (
            <div className="text-center py-12"></div>
          ) : (
            <div className="text-center py-8 sm:py-12 lg:py-20">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button className="btn-primary">프로필 수정</button>
                <button className="btn-outline">여행 기록</button>
              </div>
            </div>
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
        </div>
      </main>
    </div>
  );
};

export default MyPage;
