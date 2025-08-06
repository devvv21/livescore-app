// src/components/SearchableSelect.tsx

'use client';

import Select, { StylesConfig } from 'react-select';

interface OptionType {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: OptionType[];
  value: OptionType | null;
  onChange: (option: OptionType | null) => void;
  placeholder?: string;
}

// Custom styles to match your dark theme
const customStyles: StylesConfig<OptionType, false> = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#1A202C',
    borderColor: '#4A5568',
    color: 'white',
    minHeight: '42px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#A0AEC0',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#2D3748',
    borderColor: '#4A5568',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#4A5568' : state.isFocused ? '#1A202C' : '#2D3748',
    color: 'white',
    '&:active': {
      backgroundColor: '#4A5568',
    },
  }),
  input: (provided) => ({
    ...provided,
    color: 'white',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#A0AEC0',
  }),
};

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...'
}: SearchableSelectProps) {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      styles={customStyles}
      placeholder={placeholder}
      isClearable
    />
  );
}