import styled from "@emotion/styled";

// Main container styles
export const GameContainer = styled.div<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  position: relative;
  color: white;
  text-align: center;

  ${props => props.isLandscapeMobile ? `
    height: 100vh;
    display: flex;
    flex-direction: row;
    padding: 0.5rem;
    gap: 1rem;
  ` : `
    display: flex;
    flex-direction: column;
    align-items: center;
    ${props.isMobile ? `
      height: 100vh;
      justify-content: space-between;
      padding: 0.25rem;
    ` : `
      min-height: 100vh;
      justify-content: center;
      padding: 1rem 2rem;
    `}
  `}
`;

export const InfoContainer = styled.div<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  ${props => props.isLandscapeMobile ? `
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    width: 12rem;
    text-align: left;
  ` : `
    text-align: center;
    ${props.isMobile ? 'margin-bottom: 0.25rem;' : 'margin-bottom: 1rem 1.5rem;'}
  `}
`;

// Title and user info styles
export const GameTitle = styled.h1<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  font-weight: bold;
  color: white;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  
  ${props => props.isLandscapeMobile ? `
    font-size: 1rem;
  ` : props.isMobile ? `
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  ` : `
    font-size: 3rem;
    margin-bottom: 1rem;
    text-align: center;
    
    @media (min-width: 768px) {
      font-size: 3rem;
    }
  `}
`;

export const UserInfo = styled.span<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  display: flex;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  
  ${props => props.isLandscapeMobile ? `
    flex-direction: column;
    font-size: 0.75rem;
  ` : `
    align-items: center;
    justify-content: center;
    ${props.isMobile ? `
      font-size: 0.75rem;
    ` : `
      font-size: 0.875rem;
      gap: 1rem;
      
      @media (min-width: 768px) {
        font-size: 1rem;
      }
    `}
  `}
`;

// Orientation modal styles
export const OrientationModal = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  color: white;
`;

export const OrientationContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const OrientationIcons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  
  .phone-icon {
    font-size: 3.75rem;
  }
  
  .rotate-icon {
    font-size: 2.25rem;
  }
`;

export const OrientationTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #594A3C;
  margin-bottom: 1rem;
`;

export const OrientationText = styled.p`
  color: #8C7764;
  margin-bottom: 1.5rem;
`;