import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "../services/authService";

/**
 * 인증 상태 관리 스토어
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // 상태
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      // 액션들
      /**
       * 로그인
       */
      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          const result = await authService.login(email, password);

          if (result.success) {
            const user = authService.getCurrentUser();
            set({
              isAuthenticated: true,
              user: user,
              token: user?.token,
              loading: false,
              error: null,
            });
            return { success: true };
          } else {
            set({
              loading: false,
              error: result.error,
            });
            return { success: false, error: result.error };
          }
        } catch (error) {
          console.error("로그인 중 오류:", error);
          set({
            loading: false,
            error: "로그인 중 오류가 발생했습니다.",
          });
          return { success: false, error: "로그인 중 오류가 발생했습니다." };
        }
      },

      /**
       * 회원가입
       */
      register: async (name, email, password, birthdate) => {
        set({ loading: true, error: null });

        try {
          const result = await authService.register(
            name,
            email,
            password,
            birthdate
          );

          if (result.success) {
            set({
              loading: false,
              error: null,
            });
            return { success: true };
          } else {
            set({
              loading: false,
              error: result.error,
            });
            return { success: false, error: result.error };
          }
        } catch (error) {
          console.error("회원가입 중 오류:", error);
          set({
            loading: false,
            error: "회원가입 중 오류가 발생했습니다.",
          });
          return { success: false, error: "회원가입 중 오류가 발생했습니다." };
        }
      },

      /**
       * 로그아웃
       */
      logout: () => {
        authService.logout();
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        });
      },

      /**
       * 토큰 검증 및 사용자 정보 복원
       */
      checkAuth: async () => {
        console.log("🔍 checkAuth 호출됨");
        const user = authService.getCurrentUser();
        console.log("👤 getCurrentUser 결과:", user);

        if (user && user.token) {
          // 먼저 로그인 상태로 설정 (사용자 경험 개선)
          set({
            isAuthenticated: true,
            user: user,
            token: user.token,
          });
          console.log("🎉 로그인 상태로 설정됨");

          // 백그라운드에서 토큰 검증 및 갱신 시도
          try {
            console.log("🔐 토큰 검증 시작:", user.token);
            const isValid = await authService.validateToken(user.token);
            console.log("✅ 토큰 검증 결과:", isValid);

            if (!isValid) {
              // 토큰이 유효하지 않으면 토큰 갱신 시도
              console.log("❌ 토큰이 유효하지 않음, 토큰 갱신 시도");
              const refreshResult = await authService.refreshToken(user.token);

              if (refreshResult.success) {
                console.log("🔄 토큰 갱신 성공");
                set({ token: refreshResult.newToken });
              } else {
                console.log("❌ 토큰 갱신 실패, 로그아웃 처리");
                get().logout();
              }
            } else {
              // 토큰이 유효하면 백그라운드에서 갱신 시도
              setTimeout(async () => {
                try {
                  const refreshResult = await authService.refreshToken(
                    user.token
                  );
                  if (refreshResult.success) {
                    console.log("🔄 토큰 자동 갱신 성공");
                    set({ token: refreshResult.newToken });
                  }
                } catch (error) {
                  console.log("토큰 갱신 실패 (무시됨):", error);
                }
              }, 1000);
            }
          } catch (error) {
            console.error("토큰 검증 실패:", error);
            // 네트워크 오류 등으로 토큰 검증이 실패한 경우, 로그인 상태 유지
            console.log("⚠️ 토큰 검증 실패했지만 로그인 상태 유지");
          }
        } else {
          console.log("🚫 사용자 정보 없음, 로그아웃 상태로 설정");
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
        }
      },

      /**
       * 초기화 (앱 시작 시 호출)
       */
      initialize: async () => {
        console.log("🚀 AuthStore 초기화 시작");
        await get().checkAuth();
        console.log("✅ AuthStore 초기화 완료");
      },

      /**
       * 에러 초기화
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage", // localStorage 키
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
      // 새로고침 시에도 상태 유지
      skipHydration: false,
      // 상태 복원 시 자동으로 인증 상태 설정
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("🔄 상태 복원 완료:", {
            isAuthenticated: state.isAuthenticated,
            hasUser: !!state.user,
            hasToken: !!state.token,
          });

          // 저장된 인증 정보가 있으면 일단 로그인 상태로 설정
          if (state.user && state.token) {
            console.log("✅ 저장된 인증 정보로 로그인 상태 복원");
            state.isAuthenticated = true;
          } else {
            console.log("❌ 저장된 인증 정보 없음, 로그아웃 상태로 설정");
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
          }
        }
      },
    }
  )
);

export default useAuthStore;
