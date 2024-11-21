import React, { useEffect, useState } from 'react';

function Button({ children, onClick, color, css, loading, disabled }) {
    const [state, setState] = useState('');

    useEffect(() => {
        switch (color) {
            case 'primary':
                setState('btn btn-primary text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-800');
                break;
            case 'secondary':
                setState('btn btn-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-800');
                break;
            case 'success':
                setState('btn btn-success text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-800');
                break;
            case 'danger':
                setState('btn btn-error text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-800');
                break;
            case 'error':
                setState('btn btn-error text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-800');
                break;
            case 'warning':
                setState('btn btn-warning disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-800');
                break;
            case 'info':
                setState('btn btn-info text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-800');
                break;
            case 'neutral':
                setState('btn bg-neutral-300 text-black border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-800 hover:bg-neutral-400 hover:text-black');
                break;
            default:
                setState('btn btn-primary text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-800');
        }
    }, [color]);

    return (
        <button
            className={`${state} ${css || ''}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading ? (
                <>
                    <span className="loading loading-spinner mb-0 loading-xs"></span> Loading
                </>
            ) : (
                children
            )}
        </button>
    );
}

export default Button;
