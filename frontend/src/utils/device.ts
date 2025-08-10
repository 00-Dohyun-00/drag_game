// 모바일 기기 판단을 위한 기준 화면 너비 (768px)
export const MOBILE_SIZE_BASE = 768;

/**
 * 모바일 기기인지 확인
 * @returns {boolean} 모바일 기기인 경우 true
 */
export const isMobile = (): boolean => {
  return "ontouchstart" in window || window.innerWidth < MOBILE_SIZE_BASE;
};

/**
 * 모바일 세로 모드인지 확인
 * @returns {boolean} 모바일 세로 모드인 경우 true
 */
export const isPortraitMobile = (): boolean => {
  return (
    window.innerHeight > window.innerWidth &&
    window.innerWidth < MOBILE_SIZE_BASE
  );
};

/**
 * 모바일 가로 모드인지 확인
 * @returns {boolean} 모바일 가로 모드인 경우 true
 */
export const isLandscapeMobile = (): boolean => {
  return isMobile() && window.innerWidth > window.innerHeight;
};
