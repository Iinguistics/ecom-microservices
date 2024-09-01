import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type {
	DeleteItemCommandOutput,
	ScanCommandOutput,
	UpdateItemCommandOutput,
	QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import type CatchError from '../../utils/CatchError';
import type Product from './Product';

const {
	DeleteItemCommand,
	GetItemCommand,
	PutItemCommand,
	UpdateItemCommand,
	QueryCommand,
	ScanCommand,
} = require('@aws-sdk/client-dynamodb');
const { ddbClient } = require('./ddbClient');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { v4: uuidv4 } = require('uuid');
const handleError = require('../../utils/handleError');

class ProductTable {
	async getAllProducts(): Promise<Product[] | CatchError> {
		console.log('fetching all products');
		try {
			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME!,
			};

			const data: ScanCommandOutput = await ddbClient.send(
				new ScanCommand(params)
			);

			return (data.Items?.map((item) => unmarshall(item)) as Product[]) || [];
		} catch (e) {
			return handleError(e);
		}
	}

	async getProduct(productId: string): Promise<Product | {} | CatchError> {
		console.log(`fetching product id: ${productId}`);

		try {
			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME!,
				Key: marshall({ id: productId }),
			};

			const { Item } = await ddbClient.send(new GetItemCommand(params));

			return Item ? (unmarshall(Item) as Product) : {};
		} catch (e) {
			return handleError(e);
		}
	}

	async updateProduct(
		event: APIGatewayProxyEventV2
	): Promise<UpdateItemCommandOutput | CatchError> {
		try {
			if (!event.pathParameters?.id) {
				throw new Error(`Invalid request, missing product id`);
			}

			if (!event.body) {
				throw new Error(`Invalid request, missing event body`);
			}

			console.log(`updating product with id: "${event.pathParameters.id}"`);

			const requestBody = JSON.parse(event.body);
			const objKeys = Object.keys(requestBody);

			if (!objKeys.length) {
				throw new Error('Invalid request: Request body is empty');
			}

			const params = this.buildUpdateParams(
				event.pathParameters.id,
				requestBody,
				objKeys
			);

			const updateResult = await ddbClient.send(new UpdateItemCommand(params));

			return updateResult;
		} catch (e) {
			console.error(e);
			return handleError(e);
		}
	}

	// TODO: check for body fields / validation
	async createProduct(event: APIGatewayProxyEventV2) {
		if (!event.body) {
			throw new Error(`Invalid request, missing event body`);
		}

		console.log('creating product');
		try {
			const productRequest = JSON.parse(event.body);
			productRequest.id = uuidv4();

			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME!,
				Item: marshall(productRequest),
			};

			const createResult = await ddbClient.send(new PutItemCommand(params));

			return createResult;
		} catch (e) {
			return handleError(e);
		}
	}

	async deleteProduct(
		productId: string | undefined
	): Promise<DeleteItemCommandOutput | CatchError> {
		if (!productId) {
			throw new Error(`Invalid request, missing product id`);
		}

		console.log(`deleting product. ID: "${productId}"`);

		try {
			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME,
				Key: marshall({ id: productId }),
			};

			const deleteResult = await ddbClient.send(new DeleteItemCommand(params));

			return deleteResult;
		} catch (e) {
			return handleError(e);
		}
	}

	async getProductsByCategory(
		event: APIGatewayProxyEventV2
	): Promise<CatchError | Product[]> {
		if (!event.pathParameters?.id) {
			throw new Error(`Invalid request, missing product id`);
		}

		if (!event.queryStringParameters?.category) {
			throw new Error(`Invalid request, missing product category`);
		}

		console.log('fetching products by category');

		try {
			const category = event.queryStringParameters.category;

			const params = {
				KeyConditionExpression: 'id = :productId',
				FilterExpression: 'contains (category, :category)',
				ExpressionAttributeValues: {
					':category': { S: category },
				},
				TableName: process.env.DYNAMODB_TABLE_NAME,
			};

			const data: QueryCommandOutput = await ddbClient.send(
				new QueryCommand(params)
			);

			return (data.Items?.map((item) => unmarshall(item)) as Product[]) || [];
		} catch (e) {
			return handleError(e);
		}
	}

	private buildUpdateParams(
		id: string,
		requestBody: Record<string, any>,
		objKeys: string[]
	) {
		return {
			TableName: process.env.DYNAMODB_TABLE_NAME!,
			Key: marshall({ id }),
			UpdateExpression: `SET ${objKeys
				.map((_, index) => `#key${index} = :value${index}`)
				.join(', ')}`,
			ExpressionAttributeNames: objKeys.reduce(
				(acc, key, index) => ({
					...acc,
					[`#key${index}`]: key,
				}),
				{}
			),
			ExpressionAttributeValues: marshall(
				objKeys.reduce(
					(acc, key, index) => ({
						...acc,
						[`:value${index}`]: requestBody[key],
					}),
					{}
				)
			),
		};
	}
}

module.exports = new ProductTable();
