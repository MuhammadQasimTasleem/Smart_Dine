// Table data for reservations
export const tables = [
  { id: 1, number: 1, seats: 2, type: "Window", isAvailable: true, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400" },
  { id: 2, number: 2, seats: 4, type: "Standard", isAvailable: true, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400" },
  { id: 3, number: 3, seats: 6, type: "Family", isAvailable: false, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" },
  { id: 4, number: 4, seats: 2, type: "Romantic", isAvailable: true, image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400" },
  { id: 5, number: 5, seats: 8, type: "Party", isAvailable: true, image: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=400" },
  { id: 6, number: 6, seats: 4, type: "Outdoor", isAvailable: true, image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400" },
  { id: 7, number: 7, seats: 2, type: "VIP", isAvailable: false, image: "https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400" },
  { id: 8, number: 8, seats: 4, type: "Standard", isAvailable: true, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400" }
];

export const getTables = () => tables;
export const getAvailableTables = () => tables.filter(t => t.isAvailable);
export const getTableById = (id) => tables.find(t => t.id === id);
