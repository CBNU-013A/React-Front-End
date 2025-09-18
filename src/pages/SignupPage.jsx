import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { register, loading, error, isAuthenticated, clearError } =
    useAuthStore();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 입력 시 해당 필드의 유효성 검사 에러 제거
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // 이름 검증
    if (!formData.name.trim()) {
      errors.name = "이름을 입력해주세요.";
    } else if (formData.name.trim().length < 2) {
      errors.name = "이름은 2자 이상이어야 합니다.";
    }

    // 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "이메일을 입력해주세요.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    // 비밀번호 검증
    if (!formData.password) {
      errors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 6) {
      errors.password = "비밀번호는 6자 이상이어야 합니다.";
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      errors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    // 생년월일 검증
    if (!formData.birthdate) {
      errors.birthdate = "생년월일을 선택해주세요.";
    } else {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 14) {
        errors.birthdate = "만 14세 이상만 가입할 수 있습니다.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const birthdate = new Date(formData.birthdate);
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      birthdate
    );

    if (result.success) {
      // 회원가입 성공 시 로그인 페이지로 이동
      navigate("/login", {
        state: {
          message: "회원가입이 완료되었습니다. 로그인해주세요.",
        },
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "white" }}>
      <main>
        <div className="auth-container">
          <div className="auth-card">
            {/* 헤더 */}
            <div className="auth-header">
              <h1 className="auth-title">회원가입</h1>
            </div>

            {/* 회원가입 폼 */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* 이름 입력 */}
              <div className="auth-form-group">
                <label htmlFor="name" className="auth-label">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`auth-input ${
                    validationErrors.name ? "error" : ""
                  }`}
                  placeholder="이름을 입력하세요"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.name}
                  </p>
                )}
              </div>

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
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`auth-input ${
                    validationErrors.email ? "error" : ""
                  }`}
                  placeholder="이메일을 입력하세요"
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.email}
                  </p>
                )}
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`auth-input ${
                      validationErrors.password ? "error" : ""
                    }`}
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
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* 비밀번호 확인 입력 */}
              <div className="auth-form-group">
                <label htmlFor="confirmPassword" className="auth-label">
                  비밀번호 확인
                </label>
                <div className="auth-input-group">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`auth-input ${
                      validationErrors.confirmPassword ? "error" : ""
                    }`}
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="auth-password-toggle"
                  >
                    {showConfirmPassword ? (
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
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* 생년월일 입력 */}
              <div className="auth-form-group">
                <label htmlFor="birthdate" className="auth-label">
                  생년월일
                </label>
                <input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  required
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  className={`auth-input ${
                    validationErrors.birthdate ? "error" : ""
                  }`}
                />
                {validationErrors.birthdate && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.birthdate}
                  </p>
                )}
              </div>

              {/* 에러 메시지 */}
              {error && <div className="auth-error-message">{error}</div>}

              {/* 회원가입 버튼 */}
              <button type="submit" disabled={loading} className="auth-button">
                {loading ? (
                  <div className="auth-button-loading">
                    <div className="auth-spinner"></div>
                    회원가입 중...
                  </div>
                ) : (
                  "회원가입"
                )}
              </button>

              {/* 로그인 링크 */}
              <div className="auth-footer">
                <p className="auth-subtitle">
                  이미 계정이 있으신가요?{" "}
                  <Link to="/login" className="auth-link">
                    로그인하기
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

export default SignupPage;
