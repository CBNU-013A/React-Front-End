// 여행지 데이터 관리 - API 연결 준비

export const destinationService = {
  // 모든 여행지 가져오기
  getDestinations: () => {
    // TODO: API 연결 구현
    return [];
  },

  // ID로 여행지 가져오기
  getDestinationById: (id) => {
    // TODO: API 연결 구현
    return null;
  },

  // 카테고리별 여행지 가져오기
  getDestinationsByCategory: (category) => {
    // TODO: API 연결 구현
    return [];
  },

  // 검색어로 여행지 검색
  searchDestinations: (searchTerm) => {
    // TODO: API 연결 구현
    return [];
  },

  // 위치 기반 여행지 추천
  getNearbyDestinations: (latitude, longitude, radius = 100) => {
    // TODO: API 연결 구현
    return [];
  },
};
