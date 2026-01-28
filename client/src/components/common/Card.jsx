import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  headerAction,
  padding = true,
  hoverable = false,
  className = '' 
}) => {
  return (
    <div 
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${hoverable ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {/* Card Header */}
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      {/* Card Body */}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Card;
