import React from 'react';

export function Toast({ title, description, variant = 'default' }) {
  return (
    <div className={`toast toast-${variant}`}>
      {title && <div className="toast-title">{title}</div>}
      {description && <div className="toast-description">{description}</div>}
    </div>
  );
}

