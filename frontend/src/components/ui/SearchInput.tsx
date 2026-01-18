'use client';

import { useState, ChangeEvent } from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="search-input">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                className="input"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
            />
        </div>
    );
}
