import React from "react";
import { Link } from "react-router-dom";

const RecentSearchList = ({ recentSearches, onDeleteSearch, onClearAll }) => {
  if (!recentSearches || recentSearches.length === 0) {
    return (
      <div className="recent-search-empty">
        <div className="recent-search-empty-icon">
          <svg
            className="w-12 h-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="recent-search-empty-text">최근 검색 기록이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="recent-search-list">
      {/* 헤더 */}
      <div className="recent-search-header">
        <h3 className="recent-search-title">최근 검색</h3>
        <button className="recent-search-clear-btn" onClick={onClearAll}>
          전체 삭제
        </button>
      </div>

      {/* 검색 기록 목록 */}
      <div className="recent-search-items">
        {recentSearches.map((search) => (
          <div key={search._id} className="recent-search-item">
            {/* 장소 이미지 */}
            <div className="recent-search-image">
              {search.image ? (
                <img
                  src={search.image}
                  alt={search.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="recent-search-placeholder">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* 장소 정보 - Link로 감싸기 */}
            <Link
              to={`/location/${search._id}`}
              className="recent-search-content-link"
            >
              <div className="recent-search-content">
                <h4 className="recent-search-item-title">{search.title}</h4>
              </div>
            </Link>

            {/* 삭제 버튼 */}
            <button
              className="recent-search-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSearch(search._id);
              }}
            >
              <svg
                className="w-4 h-4"
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
        ))}
      </div>
    </div>
  );
};

export default RecentSearchList;
