const ORDER_STATUS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const storeName = ['Amazon', 'eBay', 'Walmart', 'Target', 'Best Buy', 'Newegg', 'AliExpress', 'Etsy', 'Shopify', 'Rakuten'];;
const address = ['123 Main St', '456 Elm St', '789 Oak St', '101 Maple Ave', '202 Pine St', '303 Cedar St', '404 Birch St', '505 Spruce St', '606 Walnut St', '707 Cherry St'];;
const city = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];

const getRandomStoreName = () => {
    const randomIndex = Math.floor(Math.random() * storeName.length);
    return storeName[randomIndex];
}

const getRandomStatus = () => {
    const randomIndex = Math.floor(Math.random() * ORDER_STATUS.length);
    return ORDER_STATUS[randomIndex];
}

const getRandomAddress = () => {
    const randomIndex = Math.floor(Math.random() * address.length);
    return address[randomIndex];
}

const getRandomCity = () => {
    const randomIndex = Math.floor(Math.random() * city.length);
    return city[randomIndex];
}

const orders = Array.from({length:10},(_, index) => ({
    id: index + 1,
    address: getRandomAddress(),
    city: getRandomCity(),
    storeName: getRandomStoreName(),
    status: getRandomStatus(),
    createdAt: new Date(),
    updatedAt: new Date()
}));

module.exports = orders;
