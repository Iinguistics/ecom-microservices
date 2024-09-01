import {
	DeleteItemCommand,
	GetItemCommand,
	PutItemCommand,
	UpdateItemCommand,
	QueryCommand,
	ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { ddbClient } from './ddbClient';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import Product from './Product';

class ProductTable {
	async getAllProducts(): Promise<Product[]> {
		console.log('fetching all products');
		try {
			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME,
			};

			const data = await ddbClient.send(new ScanCommand(params));

			return (data.Items?.map((item) => unmarshall(item)) as Product[]) || [];
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async getProduct(productId: string): Promise<Product | {}> {
		console.log(`fetching product id: ${productId}`);

		try {
			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME,
				Key: marshall({ id: productId }),
			};

			const { Item } = await ddbClient.send(new GetItemCommand(params));

			return Item ? (unmarshall(Item) as Product) : {};
		} catch (e) {
			console.error(e);
			throw e;
		}
	}
}

export default new ProductTable();
