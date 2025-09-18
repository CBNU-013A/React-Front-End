import React, { useState, useEffect } from "react";
import useLikeStore from "../stores/likeStore";
import useAuthStore from "../stores/authStore";
import LoginModal from "./LoginModal";

const LikeButton = ({
  placeId,
  placeName,
  showCount = false,
  size = "medium",
  isLiked: externalIsLiked,
  onToggleLike: externalOnToggleLike,
}) => {
  const { isAuthenticated } = useAuthStore();
  const {
    likedPlaces,
    isPlaceLiked,
    toggleLike,
    getLikeCount,
    getStoredLikeCount,
    loading,
  } = useLikeStore();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isToggling, setIsToggling] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 좋아요 상태 확인
  useEffect(() => {
    console.log(
      `LikeButton useEffect: placeId=${placeId}, isAuthenticated=${isAuthenticated}, likedPlaces=${likedPlaces.length}`
    );

    // 외부에서 전달받은 isLiked가 있으면 우선 사용
    if (externalIsLiked !== undefined) {
      setIsLiked(externalIsLiked);
      return;
    }

    if (placeId && isAuthenticated) {
      const liked = isPlaceLiked(placeId);
      console.log(`좋아요 상태 업데이트: ${placeId} -> ${liked}`);
      setIsLiked(liked);
    } else if (!isAuthenticated) {
      setIsLiked(false);
    }
  }, [placeId, isAuthenticated, likedPlaces, isPlaceLiked, externalIsLiked]);

  // 좋아요 개수 로드 및 실시간 업데이트
  useEffect(() => {
    if (isAuthenticated && showCount && placeName && placeId) {
      // 스토어에서 저장된 개수 확인 (0도 유효한 값)
      const storedCount = getStoredLikeCount(placeId);
      if (storedCount !== undefined && storedCount !== null) {
        setLikeCount(storedCount);
        console.log("스토어에서 좋아요 개수 로드:", storedCount);
      } else {
        // 스토어에 없으면 API에서 가져오기
        const loadLikeCount = async () => {
          try {
            const count = await getLikeCount(placeId);
            setLikeCount(count);
            console.log("API에서 좋아요 개수 로드:", count);
          } catch (error) {
            console.error("좋아요 개수 로드 실패:", error);
            setLikeCount(0);
          }
        };
        loadLikeCount();
      }
    } else if (!isAuthenticated) {
      setLikeCount(0);
    }
  }, [
    isAuthenticated,
    showCount,
    placeId,
    getStoredLikeCount,
    getLikeCount,
    likedPlaces, // likedPlaces가 변경될 때마다 개수도 업데이트
  ]);

  const handleToggleLike = async (e) => {
    // 이벤트 전파 방지 (부모 요소의 클릭 이벤트 막기)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log(
      `handleToggleLike 호출: placeId=${placeId}, isAuthenticated=${isAuthenticated}, isToggling=${isToggling}`
    );

    // 외부에서 전달받은 onToggleLike 함수가 있으면 우선 사용
    if (externalOnToggleLike) {
      externalOnToggleLike();
      return;
    }

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (isToggling) return;

    console.log(`좋아요 토글 시작: ${placeId}, 현재 상태: ${isLiked}`);

    try {
      setIsToggling(true);
      const success = await toggleLike(placeId);

      console.log(`좋아요 토글 결과: ${success}`);

      if (success) {
        // 상태는 likedPlaces가 업데이트되면서 자동으로 반영됨
        // 좋아요 개수 즉시 업데이트 (장소별 개수)
        if (showCount && placeId) {
          // 토글 후 즉시 개수 업데이트
          const newLikeCount = getStoredLikeCount(placeId);
          setLikeCount(newLikeCount);
          console.log("토글 후 장소별 좋아요 개수:", newLikeCount);
        }
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const disabledButton = (
    <button
      className={`like-button like-button-${size} like-button-disabled`}
      onClick={() => setShowLoginModal(true)}
      title="로그인이 필요합니다"
    >
      <svg
        className="like-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showCount && <span className="like-count">{likeCount}</span>}
    </button>
  );

  const authenticatedButton = (
    <button
      className={`like-button like-button-${size} ${isLiked ? "liked" : ""} ${
        isToggling ? "toggling" : ""
      }`}
      onClick={handleToggleLike}
      disabled={isToggling || loading}
      title={isLiked ? "좋아요 취소" : "좋아요"}
    >
      <svg
        className="like-icon"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showCount && <span className="like-count">{likeCount}</span>}
      {isToggling && <span className="like-loading">...</span>}
    </button>
  );

  return (
    <>
      {isAuthenticated ? authenticatedButton : disabledButton}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="로그인이 필요합니다"
        message="좋아요 기능을 사용하려면 로그인해주세요."
      />
    </>
  );
};

export default LikeButton;
