'use client';

interface FilterChip {
    id: string;
    label: string;
}

interface FilterChipsProps {
    chips: FilterChip[];
    activeChip: string;
    onChange: (chipId: string) => void;
}

export default function FilterChips({ chips, activeChip, onChange }: FilterChipsProps) {
    return (
        <div className="filter-chips">
            {chips.map((chip) => (
                <button
                    key={chip.id}
                    className={`chip ${activeChip === chip.id ? 'active' : ''}`}
                    onClick={() => onChange(chip.id)}
                >
                    {chip.label}
                </button>
            ))}
        </div>
    );
}
