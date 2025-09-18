import React from "react";
import { Link } from "react-router-dom";
import LikeButton from "./LikeButton";

const SearchResultCard = ({
  location,
  onLocationClick,
  showCount = true,
  isLiked,
  onToggleLike,
}) => {
  const handleClick = () => {
    if (onLocationClick) {
      onLocationClick(location);
    }
  };

  const CardContent = () => (
    <div className="search-result-card">
      {/* 장소 이미지 */}
      <div className="search-result-image">
        {location.firstimage ? (
          <img
            src={location.firstimage}
            alt={location.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="search-result-placeholder">
            <svg
              className="w-8 h-8 text-gray-400"
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

      {/* 장소 정보 */}
      <div className="search-result-content">
        <h3 className="search-result-title">{location.title}</h3>

        {location.addr1 && (
          <p className="search-result-address">{location.addr1}</p>
        )}

        {location.overview && (
          <p className="search-result-description">
            {location.overview.length > 100
              ? `${location.overview.substring(0, 100)}...`
              : location.overview}
          </p>
        )}

        {/* 카테고리 태그 */}
        {location.cat1 && (
          <div className="search-result-tags">
            <span className="search-result-tag">{location.cat1}</span>
            {location.cat2 && (
              <span className="search-result-tag">{location.cat2}</span>
            )}
          </div>
        )}
      </div>

      {/* 좋아요 버튼 */}
      <div className="search-result-actions">
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <LikeButton
            placeId={location._id}
            placeName={location.title}
            showCount={showCount}
            size="small"
            isLiked={isLiked}
            onToggleLike={onToggleLike}
          />
        </div>
      </div>
    </div>
  );

  return onLocationClick ? (
    <div className="search-result-card-link" onClick={handleClick}>
      <CardContent />
    </div>
  ) : (
    <Link to={`/location/${location._id}`} className="search-result-card-link">
      <CardContent />
    </Link>
  );
};

export default SearchResultCard;
