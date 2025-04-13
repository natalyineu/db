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
 * A reusable card component for containing content with optional header and footer
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
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
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
        <div className={`px-4 py-3 border-b border-gray-200 ${headerClassName}`}>
          {typeof title === 'string' ? (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      
      <div className={`p-4 ${contentClassName}`}>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          children
        )}
      </div>
      
      {footer && (
        <div className={`px-4 py-3 border-t border-gray-200 bg-gray-50 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 