import React from 'react';
import { zIndex } from './ResponsiveDesignSystem';

type AnchorPosition = 'top' | 'right' | 'bottom' | 'left' | 'center';
type Alignment = 'start' | 'center' | 'end';

interface PositionedElementProps {
  children: React.ReactNode;
  position: AnchorPosition;
  alignment?: Alignment;
  offset?: string;
  zIndex?: number;
  className?: string;
}

export const PositionedElement: React.FC<PositionedElementProps> = ({
  children,
  position,
  alignment = 'center',
  offset = 'var(--badge-offset)',
  zIndex: customZIndex = zIndex.badges,
  className = ''
}) => {
  const getPositionStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      position: 'absolute',
      zIndex: customZIndex
    };

    switch (position) {
      case 'top':
        styles.bottom = `calc(100% + ${offset})`;
        if (alignment === 'center') {
          styles.left = '50%';
          styles.transform = 'translateX(-50%)';
        } else if (alignment === 'start') {
          styles.left = '0';
        } else {
          styles.right = '0';
        }
        break;
        
      case 'bottom':
        styles.top = `calc(100% + ${offset})`;
        if (alignment === 'center') {
          styles.left = '50%';
          styles.transform = 'translateX(-50%)';
        } else if (alignment === 'start') {
          styles.left = '0';
        } else {
          styles.right = '0';
        }
        break;
        
      case 'left':
        styles.right = `calc(100% + ${offset})`;
        if (alignment === 'center') {
          styles.top = '50%';
          styles.transform = 'translateY(-50%)';
        } else if (alignment === 'start') {
          styles.top = '0';
        } else {
          styles.bottom = '0';
        }
        break;
        
      case 'right':
        styles.left = `calc(100% + ${offset})`;
        if (alignment === 'center') {
          styles.top = '50%';
          styles.transform = 'translateY(-50%)';
        } else if (alignment === 'start') {
          styles.top = '0';
        } else {
          styles.bottom = '0';
        }
        break;
        
      case 'center':
        styles.top = '50%';
        styles.left = '50%';
        styles.transform = 'translate(-50%, -50%)';
        break;
    }

    return styles;
  };

  return (
    <div className={`positioned-element ${className}`} style={getPositionStyles()}>
      {children}
    </div>
  );
};