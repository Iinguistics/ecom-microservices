interface BasketItem {
	productId: string;
	quantity: number;
	price: number;
}

interface Basket {
	userName: string;
	paymentMethod: string;
	items: BasketItem[];
}

export default Basket;
