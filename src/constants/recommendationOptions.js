// 추천 옵션 하드코딩 데이터
export const RECOMMENDATION_OPTIONS = {
  // 동행 카테고리 (category: 68cabaf0a9613e0e59a214cb)
  ACCOMPANY: [
    { id: "68cabaf0a9613e0e59a214cf", name: "혼자" },
    { id: "68cabaf0a9613e0e59a214d0", name: "가족" },
    { id: "68cabaf0a9613e0e59a214d1", name: "연인" },
    { id: "68cabaf0a9613e0e59a214d2", name: "친구" },
    { id: "68cabaf0a9613e0e59a214d3", name: "반려동물" },
    { id: "68cabaf0a9613e0e59a214d4", name: "단체" },
    { id: "68cabaf0a9613e0e59a214d5", name: "none", isActive: false },
  ],

  // 계절/시간 카테고리 (category: 68cabaf0a9613e0e59a214cc)
  SEASON: [
    { id: "68cabaf0a9613e0e59a214d6", name: "봄" },
    { id: "68cabaf0a9613e0e59a214d7", name: "여름" },
    { id: "68cabaf0a9613e0e59a214d8", name: "가을" },
    { id: "68cabaf0a9613e0e59a214d9", name: "겨울" },
    { id: "68cabaf0a9613e0e59a214da", name: "주간" },
    { id: "68cabaf0a9613e0e59a214db", name: "야간" },
  ],

  // 장소 카테고리 (category: 68cabaf0a9613e0e59a214cd)
  PLACE: [
    { id: "68cabaf0a9613e0e59a214dc", name: "자연경관" },
    { id: "68cabaf0a9613e0e59a214dd", name: "도시명소" },
    { id: "68cabaf0a9613e0e59a214de", name: "문화역사" },
    { id: "68cabaf0a9613e0e59a214df", name: "상업" },
    { id: "68cabaf0a9613e0e59a214e0", name: "휴양" },
  ],

  // 활동 카테고리 (category: 68cabaf0a9613e0e59a214ce)
  ACTIVITY: [
    { id: "68cabaf0a9613e0e59a214e1", name: "탐방" },
    { id: "68cabaf0a9613e0e59a214e2", name: "관람" },
    { id: "68cabaf0a9613e0e59a214e3", name: "참여" },
    { id: "68cabaf0a9613e0e59a214e4", name: "먹거리" },
    { id: "68cabaf0a9613e0e59a214e5", name: "쇼핑" },
    { id: "68cabaf0a9613e0e59a214e6", name: "포토존" },
  ],

  // 편의시설 (conveniences) - 예시 ID
  CONVENIENCES: [
    { id: "68cabaf0a9613e0e59a214c3", name: "주차장" },
    { id: "68cabaf0a9613e0e59a214c4", name: "화장실" },
    { id: "68cabaf0a9613e0e59a214c5", name: "휠체어 접근" },
    { id: "68cabaf0a9613e0e59a214c6", name: "WiFi" },
    { id: "68cabaf0a9613e0e59a214c7", name: "음식점" },
  ],
};

// 도시 목록
export const AVAILABLE_CITIES = [
  "청주",
  "제천",
  "충주",
  "진천",
  "음성",
  "괴산",
  "단양",
  "보은",
  "옥천",
  "영동",
  "증평",
];
