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
          try {
            console.log("🔐 토큰 검증 시작:", user.token);
            const isValid = await authService.validateToken(user.token);
            console.log("✅ 토큰 검증 결과:", isValid);

            if (isValid) {
              set({
                isAuthenticated: true,
                user: user,
                token: user.token,
              });
              console.log("🎉 로그인 상태로 설정됨");
            } else {
              // 토큰이 유효하지 않으면 로그아웃
              console.log("❌ 토큰이 유효하지 않음, 로그아웃 처리");
              get().logout();
            }
          } catch (error) {
            console.error("토큰 검증 실패:", error);
            get().logout();
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
    }
  )
);

export default useAuthStore;
