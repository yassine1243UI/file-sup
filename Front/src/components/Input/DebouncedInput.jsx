import React, { useState, useEffect } from 'react';
import Input from './Input';

const DebouncedInput = ({
  label,
  children,
  labelWeight,
  placeholder,
  pattern,
  value,
  onChange,
  type = "text",
  name,
  required = false,
  disabled = false,
  color,
  css = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Call onChange with the debounced value
  useEffect(() => {
    if (onChange && typeof onChange === 'function') {
      onChange(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <Input
      label={label}
      children={children}
      labelWeight={labelWeight}
      placeholder={placeholder}
      pattern={pattern}
      value={value}
      onChange={(e) => setSearchTerm(e.target.value)}
      type={type}
      name={name}
      required={required}
      disabled={disabled}
      color={color}
      css={css}
    />
  );
};

export default DebouncedInput;
