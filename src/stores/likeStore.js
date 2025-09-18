import { create } from "zustand";
import { persist } from "zustand/middleware";
import likeService from "../services/likeService";
import useAuthStore from "./authStore";

const useLikeStore = create(
  persist(
    (set, get) => ({
      // 상태
      likedPlaces: [], // 좋아요한 장소 목록
      likeCounts: {}, // 장소별 좋아요 개수 {placeId: count}
      loading: false,
      error: null,

      // 액션들
      // 좋아요한 장소 목록 로드
      loadLikedPlaces: async () => {
        const { user, token } = useAuthStore.getState();
        console.log("loadLikedPlaces 호출됨:", {
          user: user,
          hasToken: !!token,
        });

        if (!user || !token) {
          console.log("사용자 정보 없음, 좋아요 목록 로드 스킵");
          return;
        }

        try {
          set({ loading: true, error: null });
          console.log("좋아요 목록 로드 시작:", user.userId);

          const likedPlaces = await likeService.loadUserLikePlaces(
            user.userId,
            token
          );
          console.log("좋아요 목록 로드 완료:", likedPlaces);

          set({ likedPlaces, loading: false });
        } catch (error) {
          console.error("좋아요 목록 로드 실패:", error);
          // 네트워크 에러나 서버 연결 실패인 경우
          if (
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError") ||
            error.message.includes("fetch")
          ) {
            set({
              error:
                "서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.",
              loading: false,
            });
          } else {
            set({
              error: "좋아요 목록을 불러오는데 실패했습니다.",
              loading: false,
            });
          }
        }
      },

      // 특정 장소의 좋아요 상태 확인
      isPlaceLiked: (placeId) => {
        const { likedPlaces } = get();
        const isLiked = likedPlaces.some((place) => place._id === placeId);
        console.log(
          `isPlaceLiked 체크: placeId=${placeId}, likedPlaces=${likedPlaces.length}, isLiked=${isLiked}`
        );
        return isLiked;
      },

      // 좋아요 토글
      toggleLike: async (placeId) => {
        const { user, token } = useAuthStore.getState();
        if (!user || !token) {
          console.log("로그인이 필요합니다.");
          return false;
        }

        const { likedPlaces, isPlaceLiked } = get();
        const isLiked = isPlaceLiked(placeId);

        try {
          set({ loading: true, error: null });
          console.log("좋아요 토글 시작:", {
            placeId,
            isLiked,
            currentLikedPlaces: likedPlaces,
            userId: user.userId,
            token: token ? "있음" : "없음",
          });

          const success = await likeService.toggleLike(
            user.userId,
            placeId,
            token,
            isLiked
          );

          console.log("API 토글 결과:", success);

          if (success) {
            let newLikedPlaces;
            const { likeCounts } = get();
            let newLikeCounts = { ...likeCounts };

            if (isLiked) {
              // 좋아요 제거
              newLikedPlaces = likedPlaces.filter(
                (place) => place._id !== placeId
              ); // 좋아요 개수 감소 (즉시 반영)
              if (newLikeCounts[placeId] && newLikeCounts[placeId] > 0) {
                newLikeCounts[placeId] = newLikeCounts[placeId] - 1;
              } else {
                newLikeCounts[placeId] = 0;
              }
              console.log("좋아요 제거 완료, 개수:", newLikeCounts[placeId]);
            } else {
              // 좋아요 추가 - 실제 장소 정보는 별도로 가져와야 함
              // 여기서는 placeId만 저장하고, 실제 정보는 즐겨찾기 페이지에서 로드
              const newPlace = { _id: placeId };
              newLikedPlaces = [...likedPlaces, newPlace];
              // 좋아요 개수 증가 (즉시 반영)
              newLikeCounts[placeId] = (newLikeCounts[placeId] || 0) + 1;
              console.log("좋아요 추가 완료, 개수:", newLikeCounts[placeId]);
            }

            console.log("좋아요 목록 업데이트:", {
              before: likedPlaces,
              after: newLikedPlaces,
            });
            set({
              likedPlaces: newLikedPlaces,
              likeCounts: newLikeCounts,
              loading: false,
            });
            return true;
          } else {
            set({ error: "좋아요 상태 변경에 실패했습니다.", loading: false });
            return false;
          }
        } catch (error) {
          console.error("좋아요 토글 실패:", error);
          set({ error: "좋아요 상태 변경에 실패했습니다.", loading: false });
          return false;
        }
      },

      // 장소별 좋아요 개수 가져오기
      getLikeCount: async (placeId) => {
        const { token } = useAuthStore.getState();
        if (!placeId) return 0;

        try {
          console.log("좋아요 개수 조회 시도:", placeId);
          const count = await likeService.getLocationLikeCount(placeId, token);

          // 스토어에 개수 저장
          const { likeCounts } = get();
          set({
            likeCounts: {
              ...likeCounts,
              [placeId]: count,
            },
          });

          return count;
        } catch (error) {
          console.error("좋아요 개수 조회 실패:", error);
          return 0;
        }
      },

      // 스토어에서 장소별 좋아요 개수 가져오기
      getStoredLikeCount: (placeId) => {
        const { likeCounts } = get();
        return likeCounts[placeId];
      },

      // 좋아요한 장소 개수 가져오기 (사용자별)
      getUserLikeCount: () => {
        const { likedPlaces } = get();
        return likedPlaces.length;
      },

      // 에러 초기화
      clearError: () => set({ error: null }),

      // 스토어 초기화 (로그아웃 시)
      reset: () =>
        set({
          likedPlaces: [],
          likeCounts: {},
          loading: false,
          error: null,
        }),
    }),
    {
      name: "like-store",
      // 좋아요한 장소 목록만 persist
      partialize: (state) => ({ likedPlaces: state.likedPlaces }),
    }
  )
);

export default useLikeStore;
