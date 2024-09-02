import type { APIGatewayProxyEvent } from 'aws-lambda';
import type {
	DeleteItemCommandOutput,
	ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import type Basket from './Basket';

const {
	DeleteItemCommand,
	GetItemCommand,
	PutItemCommand,
	ScanCommand,
} = require('@aws-sdk/client-dynamodb');
const { ddbClient } = require('./ddbClient');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const BasketEventBridge = require('./BasketEventBridge');

class BasketTable {
	async getAllBaskets(): Promise<Basket[]> {
		console.log('fetching all baskets');
		try {
			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME!,
			};

			const data: ScanCommandOutput = await ddbClient.send(
				new ScanCommand(params)
			);

			return (data.Items?.map((item) => unmarshall(item)) as Basket[]) || [];
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async getBasket(userName: string): Promise<Basket> {
		console.log(`fetching basket, userName: ${userName}`);

		try {
			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME!,
				Key: marshall({ userName: userName.toLowerCase() }),
			};

			const { Item } = await ddbClient.send(new GetItemCommand(params));

			if (!Item) {
				throw new Error(`Basket not found for user: ${userName}`);
			}

			return unmarshall(Item) as Basket;
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async createBasket(event: APIGatewayProxyEvent) {
		if (!event.body) {
			throw new Error(`Invalid request, missing event body`);
		}

		console.log('creating basket');
		try {
			const basketRequest = JSON.parse(event.body);

			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME!,
				Item: marshall(basketRequest),
			};

			const createResult = await ddbClient.send(new PutItemCommand(params));

			return createResult;
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async deleteBasket(
		userName: string | undefined
	): Promise<DeleteItemCommandOutput> {
		if (!userName) {
			throw new Error(`Invalid request, missing basket username`);
		}

		console.log(`deleting basket userName: "${userName}"`);

		try {
			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME,
				Key: marshall({ userName }),
			};

			const deleteResult = await ddbClient.send(new DeleteItemCommand(params));

			return deleteResult;
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async checkoutBasket(event: APIGatewayProxyEvent): Promise<void> {
		if (!event.body) {
			throw new Error(`Invalid request, missing event body`);
		}

		const checkoutRequest = JSON.parse(event.body);

		if (!checkoutRequest?.userName) {
			throw new Error(
				`userName should exist in checkoutRequest: "${checkoutRequest}"`
			);
		}

		console.log('processing basket checkout');

		const basket = await this.getBasket(checkoutRequest.userName);

		const checkoutPayload = BasketTable.prepareOrderPayload(
			checkoutRequest,
			basket
		);

		await BasketEventBridge.publishCheckoutBasketEvent(checkoutPayload);

		await this.deleteBasket(checkoutRequest.userName);
	}

	private static prepareOrderPayload(checkoutRequest, basket: Basket) {
		console.log('prepareOrderPayload');

		try {
			if (!basket?.items) {
				throw new Error(`missing basket items: "${basket}"`);
			}

			let totalPrice = 0;
			basket.items.forEach((item) => (totalPrice = totalPrice + item.price));
			checkoutRequest.total = totalPrice;

			Object.assign(checkoutRequest, basket);
			return checkoutRequest;
		} catch (e) {
			console.error(e);
			throw e;
		}
	}
}

module.exports = new BasketTable();
