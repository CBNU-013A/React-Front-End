const BASE_URL = "/api";

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
      // 네트워크 에러인 경우 토큰을 유효하다고 간주 (오프라인 모드)
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("fetch")
      ) {
        console.log("네트워크 에러로 인한 토큰 검증 실패, 토큰 유효성 유지");
        return true;
      }
      return false;
    }
  }

  /**
   * 토큰 자동 갱신
   * @param {string} token - 현재 토큰
   * @returns {Promise<{success: boolean, newToken?: string}>}
   */
  async refreshToken(token) {
    try {
      const response = await fetch(`${BASE_URL}/api/refresh-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        const newToken = data.token;

        // 새 토큰으로 로컬 스토리지 업데이트
        localStorage.setItem("token", newToken);

        return { success: true, newToken };
      }
      return { success: false };
    } catch (error) {
      console.error("토큰 갱신 실패:", error);
      return { success: false };
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
    console.log("🔍 getCurrentUser 호출됨");

    // zustand persist에서 저장된 데이터 확인
    const authData = localStorage.getItem("auth-storage");
    console.log("📦 auth-storage 데이터:", authData ? "존재함" : "없음");

    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const state = parsed.state;
        console.log("📋 파싱된 상태:", {
          hasState: !!state,
          hasUser: !!(state && state.user),
          hasToken: !!(state && state.token),
          user: state?.user,
        });

        if (state && state.user && state.token) {
          const user = {
            _id: state.user._id,
            token: state.token,
            userId: state.user._id,
            userName: state.user.userName || state.user.name,
            userEmail: state.user.userEmail || state.user.email,
            name: state.user.userName || state.user.name,
            email: state.user.userEmail || state.user.email,
          };
          console.log("✅ zustand에서 사용자 정보 반환:", user);
          return user;
        }
      } catch (error) {
        console.error("❌ auth-storage 파싱 오류:", error);
      }
    }

    // 기존 방식으로 fallback
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");

    console.log("🔄 기존 방식으로 fallback:", {
      hasToken: !!token,
      hasUserId: !!userId,
      hasUserName: !!userName,
      hasUserEmail: !!userEmail,
    });

    if (token && userId) {
      const user = {
        _id: userId,
        token,
        userId,
        userName,
        userEmail,
        name: userName,
        email: userEmail,
      };
      console.log("✅ 기존 방식에서 사용자 정보 반환:", user);
      return user;
    }

    console.log("❌ 사용자 정보 없음");
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

  /**
   * 회원탈퇴
   * @param {string} token - JWT 토큰
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteAccount(token) {
    try {
      const response = await fetch(`${BASE_URL}/api/user/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message || "회원탈퇴 실패" };
      }
    } catch (error) {
      console.error("회원탈퇴 오류:", error);
      return { success: false, error: "네트워크 오류가 발생했습니다." };
    }
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();

export default authService;
