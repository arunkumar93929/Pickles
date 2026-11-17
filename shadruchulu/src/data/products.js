const vegPrices = { "250 g": 149, "500 g": 279, "1 kg": 499 };
const nonVegPrices = { "250 g": 249, "500 g": 449, "1 kg": 799 };

const products = [
  { id: 1, name: "Avakaya Pickle", category: "veg", description: "A classic Andhra raw mango pickle with bold traditional flavours.", featured: true, prices: vegPrices, image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85" },
  { id: 2, name: "Gongura Pickle", category: "veg", description: "A tangy Andhra favourite made with gongura leaves.", featured: true, prices: vegPrices, image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85" },
  { id: 3, name: "Tomato Pickle", category: "veg", description: "A deliciously tangy and spicy pickle made with ripe tomatoes.", featured: true, prices: vegPrices },
  { id: 4, name: "Chinthakaya Pickle", category: "veg", description: "A traditional raw tamarind pickle with a lively tang.", featured: false, prices: vegPrices },
  { id: 5, name: "Red Chilli Pickle", category: "veg", description: "A fiery Andhra favourite for lovers of authentic spice.", featured: false, prices: vegPrices },
  { id: 6, name: "Garlic Pickle", category: "veg", description: "A rich and aromatic traditional garlic pickle.", featured: false, prices: vegPrices },
  { id: 7, name: "Chicken Pickle", category: "non-veg", description: "A bold and spicy traditional Andhra chicken delicacy.", featured: true, prices: nonVegPrices, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=85" },
  { id: 8, name: "Chicken Thokku", category: "non-veg", description: "A rich, spicy and flavour-packed chicken thokku.", featured: false, prices: nonVegPrices },
  { id: 9, name: "Mutton Pickle", category: "non-veg", description: "A hearty traditional Andhra-style mutton pickle.", featured: false, prices: nonVegPrices },
  { id: 10, name: "Prawns Pickle", category: "non-veg", description: "A flavourful seafood pickle inspired by Andhra cuisine.", featured: true, prices: nonVegPrices, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=85" },
];

export default products;
