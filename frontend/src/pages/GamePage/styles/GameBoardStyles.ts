import styled from "@emotion/styled";

export const GameBoardContainer = styled.div<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  ${props => props.isLandscapeMobile ? `
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  ` : `
    width: 100%;
    ${props.isMobile ? `
      flex: 1;
      display: flex;
      flex-direction: column;
    ` : `
      max-width: fit-content;
      margin: 0 auto;
    `}
  `}
`;

export const GameBoard = styled.div<{ isLandscapeMobile: boolean; isMobile: boolean }>`
  display: grid;
  grid-template-columns: repeat(17, 1fr);
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  ${props => props.isLandscapeMobile ? `
    gap: 1px;
    padding: 0.25rem;
    height: 100%;
    max-height: 100%;
    aspect-ratio: 17/10;
    grid-template-rows: repeat(10, 1fr);
  ` : props.isMobile ? `
    gap: 1px;
    padding: 0.25rem;
    flex: 1;
    max-width: 100%;
    height: 100%;
    grid-template-rows: repeat(10, 1fr);
  ` : `
    gap: 0.25rem;
    padding: 0.75rem 1.5rem;
    margin-top: 1rem;
  `}
`;

export const GameCell = styled.div<{ 
  isEmpty: boolean; 
  selected: boolean; 
  gameEnded: boolean; 
  isMobile: boolean;
}>`
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  font-weight: 600;
  transition: all 500ms ease-in-out;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  cursor: pointer;
  
  ${props => props.isMobile ? `
    width: 100%;
    height: 100%;
    font-size: 0.75rem;
    min-width: 0;
    min-height: 0;
  ` : `
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
    
    @media (min-width: 768px) {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1rem;
    }
  `}
  
  ${props => {
    if (props.gameEnded) {
      return props.isEmpty ? `
        background: rgba(255, 255, 255, 0.2);
        border: 1px dashed rgba(255, 255, 255, 0.3);
        cursor: default;
        opacity: 0.5;
      ` : `
        background: linear-gradient(to bottom right, #f8f1ec, #F2E4DC);
        border: 1px solid rgba(0, 0, 0, 0.2);
        color: #594A3C;
        cursor: default;
        opacity: 0.5;
      `;
    }
    
    if (props.isEmpty) {
      return `
        background: rgba(255, 255, 255, 0.3);
        border: 1px dashed rgba(255, 255, 255, 0.5);
        cursor: default;
      `;
    }
    
    if (props.selected) {
      return `
        background: linear-gradient(to bottom right, #8C7764, #594A3C);
        color: white;
        transform: scale(1.05);
        box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4), 0 4px 6px -2px rgba(239, 68, 68, 0.05);
      `;
    }
    
    return `
      background: linear-gradient(to bottom right, #f8f1ec, #F2E4DC);
      border: 1px solid rgba(0, 0, 0, 0.1);
      color: #594A3C;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
    `;
  }}
`;