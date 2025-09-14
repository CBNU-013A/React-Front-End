import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigationBar from "../widgets/NavigationBar";
import useAuthStore from "../stores/authStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, isAuthenticated, clearError } = useAuthStore();
  const navigate = useNavigate();

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // 에러 초기화
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <NavigationBar />

      <main style={{ paddingTop: "4rem" }}>
        <div className="auth-container">
          <div className="auth-card">
            {/* 헤더 */}
            <div className="auth-header">
              <h1 className="auth-title">로그인</h1>
            </div>

            {/* 로그인 폼 */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* 이메일 입력 */}
              <div className="auth-form-group">
                <label htmlFor="email" className="auth-label">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              {/* 비밀번호 입력 */}
              <div className="auth-form-group">
                <label htmlFor="password" className="auth-label">
                  비밀번호
                </label>
                <div className="auth-input-group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                    placeholder="비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-password-toggle"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && <div className="auth-error-message">{error}</div>}

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="auth-button"
              >
                {loading ? (
                  <div className="auth-button-loading">
                    <div className="auth-spinner"></div>
                    로그인 중...
                  </div>
                ) : (
                  "로그인"
                )}
              </button>

              {/* 회원가입 링크 */}
              <div className="auth-footer">
                <p className="auth-subtitle">
                  계정이 없으신가요?{" "}
                  <Link to="/signup" className="auth-link">
                    회원가입하기
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
