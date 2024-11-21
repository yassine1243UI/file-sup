import React from 'react';

const Badge = ({ children, color = 'neutral', css = '' }) => {
    return (
        <div className={`badge badge-${color} ${css}`}>
            {children}
        </div>
    );
};

export default Badge;
