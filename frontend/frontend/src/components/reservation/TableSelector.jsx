import React from 'react';
import '../../styles/reservation.css';

const TableSelector = ({ tables = [], selectedTableId, onSelect = () => {} }) => {
    const availableCount = tables.filter(t => t.isAvailable).length;
    return (
        <div className="table-selector">
            <h2>Select a Table</h2>
            <p className="availability-meta" aria-live="polite">
                {availableCount} of {tables.length} tables available
            </p>
            <div className="table-list">
                {tables.length === 0 && <p className="no-tables">No table data loaded.</p>}
                {tables.map((table) => {
                    const isSelected = selectedTableId === table.id;
                    return (
                        <div
                            key={table.id}
                            className={`table-item ${table.isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''}`}
                            onClick={() => table.isAvailable && onSelect(table)}
                            role="button"
                            tabIndex={table.isAvailable ? 0 : -1}
                            aria-disabled={!table.isAvailable}
                            aria-pressed={isSelected}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && table.isAvailable) onSelect(table);
                            }}
                        >
                            <span>Table {table.number}</span>
                            <span>{table.isAvailable ? 'Available' : 'Unavailable'}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TableSelector;