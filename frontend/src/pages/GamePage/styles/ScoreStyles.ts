import styled from "@emotion/styled";

// Score and time container styles
export const ScoreTimeContainer = styled.div<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  ${props => props.isLandscapeMobile ? `
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: white;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  ` : `
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    ${props.isMobile ? `
      flex-direction: row;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
      gap: 0.5rem;
    ` : `
      flex-direction: row;
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
      gap: 0.5rem 1rem;
      
      @media (min-width: 768px) {
        font-size: 1.25rem;
      }
    `}
  `}
  
  ${props => !props.isLandscapeMobile && !props.isMobile ? `
    width: calc(17 * (2.5rem + 0.25rem) - 0.25rem + 3rem);
  ` : ''}
`;

export const ScoreTimeInfo = styled.div<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  display: flex;
  
  ${props => props.isLandscapeMobile ? `
    flex-direction: column;
    gap: 0.25rem;
  ` : props.isMobile ? `
    flex-direction: row;
    gap: 1rem;
    font-size: 0.75rem;
  ` : `
    flex-direction: column;
    align-items: flex-start;
  `}
`;

export const ScoreText = styled.p<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  ${props => props.isLandscapeMobile ? `
    font-size: 0.875rem;
  ` : props.isMobile ? `
    font-size: 0.75rem;
  ` : `
    font-size: 0.875rem;
    
    @media (min-width: 768px) {
      font-size: 1rem;
    }
  `}
`;

export const TimeText = styled.p<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  ${props => props.isLandscapeMobile ? `
    font-size: 0.875rem;
  ` : props.isMobile ? `
    font-size: 0.75rem;
  ` : `
    font-size: 0.875rem;
    
    @media (min-width: 768px) {
      font-size: 1rem;
    }
  `}
`;

export const TimeValue = styled.span<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  ${props => props.isLandscapeMobile ? `
    font-size: 1rem;
    font-weight: bold;
  ` : props.isMobile ? `
    font-size: 0.875rem;
  ` : `
    font-size: 1.125rem;
    
    @media (min-width: 768px) {
      font-size: 1.25rem;
    }
  `}
`;