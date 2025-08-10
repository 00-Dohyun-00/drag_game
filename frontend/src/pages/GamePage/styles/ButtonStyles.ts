import styled from "@emotion/styled";

export const ButtonContainer = styled.div<{ isLandscapeMobile: boolean }>`
  display: flex;
  gap: 0.25rem;
  
  ${props => props.isLandscapeMobile ? `
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  ` : ''}
`;

export const GameButton = styled.button<{ isLandscapeMobile: boolean; isMobile: boolean; variant: 'primary' | 'secondary' }>`
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 300ms ease-in-out;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(to right, #8C7764, #594A3C);
    color: white;
    
    &:hover {
      background: linear-gradient(to right, #594A3C, #3d3329);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
  ` : `
    background: linear-gradient(to right, #c4c3c2, #bcb6b3);
    color: white;
    
    &:hover {
      background: linear-gradient(to right, #d6d6d6, #d1cbc5);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: translateY(0);
    }
  }
  
  ${props => props.isLandscapeMobile ? `
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    width: 100%;
  ` : props.isMobile ? `
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  ` : `
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    
    @media (min-width: 768px) {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  `}
`;