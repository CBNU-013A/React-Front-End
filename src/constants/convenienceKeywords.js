// 편의성 키워드 매핑
export const CONVENIENCE_KEYWORDS = {
  "68cabaf0a9613e0e59a214c2": "주차",
  "68cabaf0a9613e0e59a214c3": "교통편",
  "68cabaf0a9613e0e59a214c4": "청결/관리",
  "68cabaf0a9613e0e59a214c5": "혼잡도",
  "68cabaf0a9613e0e59a214c6": "편의시설",
  "68cabaf0a9613e0e59a214c7": "가격",
  "68cabaf0a9613e0e59a214c8": "동반",
  "68cabaf0a9613e0e59a214c9": "장소",
  "68cabaf0a9613e0e59a214ca": "활동",
};

// ObjectId를 키워드 이름으로 변환하는 함수
export const getConvenienceKeywordName = (aspectId) => {
  return CONVENIENCE_KEYWORDS[aspectId] || aspectId;
};
