const BASE_URL = "http://localhost:8001";

/**
 * 인증 서비스
 */
class AuthService {
  /**
   * 로그인
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password.trim(),
        }),
      });

      console.log("로그인 응답 상태:", response.status);
      const data = await response.json();
      console.log("로그인 응답 본문:", data);

      if (response.status === 200) {
        // 로그인 성공
        const token = data.token;
        const user = data.user;

        if (token) {
          // 로컬 스토리지에 토큰과 사용자 정보 저장
          localStorage.setItem("token", token);
          localStorage.setItem("userId", user._id || "");
          localStorage.setItem("userName", user.name || "");
          localStorage.setItem("userEmail", user.email || email);
        }

        return {
          success: true,
          data: {
            token,
            user,
          },
        };
      } else {
        return {
          success: false,
          error: data.message || "로그인에 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      return {
        success: false,
        error: "네트워크 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 회원가입
   * @param {string} name - 이름
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @param {Date} birthdate - 생년월일
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async register(name, email, password, birthdate) {
    try {
      // 날짜를 ISO 형식으로 변환
      const formattedBirthdate = birthdate.toISOString();

      const response = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          birthdate: formattedBirthdate,
        }),
      });

      console.log("회원가입 응답 상태:", response.status);
      const data = await response.json();
      console.log("회원가입 응답 본문:", data);

      if (response.status === 201) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: data.message || "회원가입에 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("회원가입 에러:", error);
      return {
        success: false,
        error: "네트워크 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 토큰 유효성 검증
   * @param {string} token - 검증할 토큰
   * @returns {Promise<boolean>}
   */
  async validateToken(token) {
    try {
      const response = await fetch(`${BASE_URL}/api/validate-token`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("토큰 검증 응답:", response.status);
      return response.status === 200;
    } catch (error) {
      console.error("토큰 검증 실패:", error);
      return false;
    }
  }

  /**
   * 로그아웃
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
  }

  /**
   * 현재 사용자 정보 가져오기
   * @returns {Object|null}
   */
  getCurrentUser() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");

    if (token && userId) {
      return {
        token,
        userId,
        userName,
        userEmail,
      };
    }

    return null;
  }

  /**
   * 로그인 상태 확인
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();

export default authService;
