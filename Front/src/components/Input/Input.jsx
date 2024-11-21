import React, { useEffect, useState } from 'react';
import './Input.css'; // Nouveau fichier CSS pour le style

function Input({
  label = '',
  children,
  labelWeight = 'normal',
  placeholder = '',
  pattern,
  value = '',
  onChange = () => {},
  type = 'text',
  name = '',
  required = false,
  disabled = false,
  color,
  css = '',
}) {
  const [state, setState] = useState('');

  useEffect(() => {
    switch (color) {
      case 'primary':
        setState('input-primary');
        break;
      case 'secondary':
        setState('input-secondary');
        break;
      case 'success':
        setState('input-success');
        break;
      case 'danger':
      case 'error':
        setState('input-error');
        break;
      case 'warning':
        setState('input-warning');
        break;
      case 'info':
        setState('input-info');
        break;
      default:
        setState('');
    }
  }, [color]);

  const handleChange = (e) => {
    if (pattern && e.target.value && !new RegExp(pattern).test(e.target.value)) {
      setState('input-error');
    } else {
      setState('input-success');
    }

    if (typeof onChange === 'function') {
      onChange(e); // Propagation de l'événement
    }
  };

  if (type === 'select') {
    return (
      <div className={`input-container ${css}`}>
        <label className={`input-label font-${labelWeight}`} htmlFor={name}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          className={`input-field select-field ${state} ${disabled ? 'disabled-field' : ''}`}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
        >
          {children}
        </select>
      </div>
    );
  }

  return (
    <div className={`input-container ${css}`}>
      <label className={`input-label font-${labelWeight}`} htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`input-field ${state} ${disabled ? 'disabled-field' : ''}`}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}

export default Input;
