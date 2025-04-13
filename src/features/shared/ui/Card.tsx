import React from 'react';

type CardVariant = 'default' | 'bordered' | 'elevated';

export interface CardProps {
  variant?: CardVariant;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  isLoading?: boolean;
}

/**
 * A reusable card component inspired by Google Ads design system
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  title,
  footer,
  children,
  className = '',
  contentClassName = '',
  headerClassName = '',
  footerClassName = '',
  isLoading = false,
}) => {
  // Base styles
  const baseStyles = 'rounded-lg overflow-hidden';
  
  // Variant styles - Google Ads inspired colors
  const variantStyles = {
    default: 'bg-white',
    bordered: 'bg-white border border-[#DADCE0]',
    elevated: 'bg-white shadow-sm',
  };
  
  // Loading styles
  const loadingStyles = isLoading ? 'animate-pulse' : '';
  
  const cardClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${loadingStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardClasses}>
      {title && (
        <div className={`px-6 py-4 border-b border-[#DADCE0] ${headerClassName}`}>
          {typeof title === 'string' ? (
            <h3 className="text-lg font-medium text-[#3C4043]">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      
      <div className={isLoading ? `p-6 ${contentClassName}` : contentClassName}>
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-[#F1F3F4] rounded-full w-3/4"></div>
            <div className="h-4 bg-[#F1F3F4] rounded-full w-1/2"></div>
            <div className="h-4 bg-[#F1F3F4] rounded-full w-5/6"></div>
            <div className="h-10 bg-[#F1F3F4] rounded-lg w-full mt-2"></div>
          </div>
        ) : (
          children
        )}
      </div>
      
      {footer && (
        <div className={`px-6 py-4 border-t border-[#DADCE0] bg-[#F8F9FA] ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 