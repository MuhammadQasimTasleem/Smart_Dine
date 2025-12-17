import React from 'react';

// Unified prop names with MenuList usage. Provides safe defaults.
const MenuFilter = ({ categories = [], activeCategory = "all", onFilterChange }) => {
    return (
        <div className="menu-filter">
            <h2>Filter by Category</h2>
            <select value={activeCategory} onChange={(e) => onFilterChange(e.target.value)}>
                <option value="all">All</option>
                {categories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default MenuFilter;