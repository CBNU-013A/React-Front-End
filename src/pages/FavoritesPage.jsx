import React from "react";
import NavigationBar from "../widgets/NavigationBar";

const FavoritesPage = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <NavigationBar />

      {/* 메인 콘텐츠 - 네비게이션바 높이만큼 상단 여백 추가 */}
      <main style={{ paddingTop: "4.5rem" }}>
        <div className="navbar-container py-4 sm:py-8 lg:py-12">
          <div className="text-center py-8 sm:py-12 lg:py-20">
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 px-4"
              style={{ color: "#3C7157" }}
            >
              즐겨찾기
            </h1>
            <p
              className="text-base sm:text-lg lg:text-xl mb-4 sm:mb-8"
              style={{ color: "#6B7280" }}
            >
              저장한 여행지들을 확인하세요
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button className="btn-primary">즐겨찾기 보기</button>
              <button className="btn-outline">정렬하기</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FavoritesPage;
