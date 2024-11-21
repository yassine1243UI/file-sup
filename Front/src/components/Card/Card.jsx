import React from 'react';
import './Card.css';

export default function Card({ title = '', css = '', children }) {
  return (
    <React.Fragment>
      <div className={`card card-background shadow-sm ${css}`}>
        {title && (
          <div className="card-header p-4">
            <h3>{title}</h3>
          </div>
        )}
        <div className="card-body">
          {children}
        </div>
      </div>
    </React.Fragment>
  );
}
