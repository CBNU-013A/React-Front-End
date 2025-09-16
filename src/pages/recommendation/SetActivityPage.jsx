import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import keywordService from "../../services/keywordService";

const SetActivityPage = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [previousSelectedCompanion, setPreviousSelectedCompanion] =
    useState("");
  const [previousSelectedTheme, setPreviousSelectedTheme] = useState("");

  useEffect(() => {
    loadPreviousSelection();
    loadCategory();
  }, []);

  const loadPreviousSelection = () => {
    const companion = localStorage.getItem("selectedWithKeyword") || "";
    const theme = localStorage.getItem("selectedThemeKeyword") || "";
    setPreviousSelectedCompanion(companion);
    setPreviousSelectedTheme(theme);
  };

  const loadCategory = async () => {
    try {
      const categoryList = await keywordService.getCategory();
      const placeCategory =
        categoryList.find((item) => item.name === "활동") || {};

      setCategory(placeCategory._id || "");
      if (placeCategory._id) {
        loadKeywords(placeCategory._id);
      }
    } catch (error) {
      console.error("카테고리 로드 오류:", error);
      setLoading(false);
    }
  };

  const loadKeywords = async (categoryId) => {
    try {
      const allKeywords = await keywordService.getAllKeywords();
      const filtered = allKeywords
        .filter((item) => item.category === categoryId)
        .map((item) => item.name);

      setKeywords(filtered);
    } catch (error) {
      console.error("키워드 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordSelect = async (label) => {
    const newValue = selectedKeyword === label ? "" : label;
    setSelectedKeyword(newValue);

    if (newValue && newValue !== "상관없음") {
      try {
        const subKeywords = await keywordService.getSubKeywords(category);
        const matched = subKeywords.find((item) => item.name === newValue);

        if (matched?._id) {
          localStorage.setItem("selectedActivityKeywordId", matched._id);
          localStorage.setItem("selectedActivityKeyword", newValue);
          console.log(
            "저장된 활동 키워드 ID:",
            matched._id,
            "키워드:",
            newValue
          );
        }
      } catch (error) {
        console.error("키워드 저장 오류:", error);
      }
    } else if (newValue === "상관없음") {
      // 상관없음 선택 시 활동 관련 데이터만 초기화
      localStorage.removeItem("selectedActivityKeywordId");
      localStorage.removeItem("selectedActivityKeyword");
      console.log("상관없음 선택 - 활동 데이터 초기화");
    } else {
      localStorage.removeItem("selectedActivityKeywordId");
      localStorage.removeItem("selectedActivityKeyword");
    }

    navigate("/recommendation/season");
  };

  const handleBack = () => {
    // 뒤로가기 시 모든 선택한 내용 초기화
    localStorage.removeItem("selectedWithKeywordId");
    localStorage.removeItem("selectedWithKeyword");
    localStorage.removeItem("selectedThemeKeywordId");
    localStorage.removeItem("selectedThemeKeyword");
    localStorage.removeItem("selectedActivityKeywordId");
    localStorage.removeItem("selectedActivityKeyword");
    localStorage.removeItem("selectedSeasonKeywordId");
    localStorage.removeItem("selectedSeasonKeyword");
    localStorage.removeItem("selectedFeatures");
    console.log("뒤로가기 - 모든 선택 데이터 초기화");
    navigate("/");
  };

  const handleCompanionClick = () => {
    navigate("/recommendation/with");
  };

  const handleThemeClick = () => {
    navigate("/recommendation/theme");
  };

  if (loading) {
    return (
      <div className="recommendation-page">
        <div className="loading-container">
          <div className="loading-spinner">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-page">
      <div className="recommendation-header">
        <button className="back-btn" onClick={handleBack}>
          돌아가기
        </button>
      </div>

      <div className="recommendation-content">
        {/* 이전 선택 표시 */}
        <div className="previous-selections">
          <div className="selection-item">
            <span>누구와 함께 가나요?</span>
            {previousSelectedCompanion && (
              <button className="selection-tag" onClick={handleCompanionClick}>
                {previousSelectedCompanion}
              </button>
            )}
          </div>
          <div className="selection-item">
            <span>여행의 테마는?</span>
            {previousSelectedTheme && (
              <button className="selection-tag" onClick={handleThemeClick}>
                {previousSelectedTheme}
              </button>
            )}
          </div>
        </div>

        <h2>여행을 가면 주로 어떤 활동을 하나요?</h2>

        <div className="keyword-selection">
          {keywords.length === 0 ? (
            <div className="loading-spinner">로딩 중...</div>
          ) : (
            <div className="keyword-grid">
              {keywords.map((keyword) => (
                <button
                  key={keyword}
                  className={`keyword-btn ${
                    selectedKeyword === keyword ? "selected" : ""
                  }`}
                  onClick={() => handleKeywordSelect(keyword)}
                >
                  {keyword}
                </button>
              ))}
              <button
                className={`keyword-btn none-option ${
                  selectedKeyword === "상관없음" ? "selected" : ""
                }`}
                onClick={() => handleKeywordSelect("상관없음")}
              >
                상관없음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetActivityPage;
