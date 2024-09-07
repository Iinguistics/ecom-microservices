import type { APIGatewayProxyEvent } from 'aws-lambda';
import type { ScanCommandOutput } from '@aws-sdk/client-dynamodb';

const {
	GetItemCommand,
	PutItemCommand,
	ScanCommand,
} = require('@aws-sdk/client-dynamodb');
const { ddbClient } = require('./ddbClient');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

class OrderTable {
	async getAllOrders() {
		console.log('fetching all products');
		try {
			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME!,
			};

			const data: ScanCommandOutput = await ddbClient.send(
				new ScanCommand(params)
			);

			return data.Items?.map((item) => unmarshall(item)) || [];
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async getOrder(event: APIGatewayProxyEvent) {
		const userName = event.pathParameters?.userName;
		const orderDate = event.queryStringParameters?.orderDate;

		if (!userName || !orderDate) {
			throw new Error(`must have required fields`);
		}

		try {
			const params = {
				KeyConditionExpression:
					'userName = :userName and orderDate = :orderDate',
				ExpressionAttributeValues: {
					':userName': { S: userName },
					':orderDate': { S: orderDate },
				},
				TableName: process.env.DYNAMODB_TABLE_NAME,
			};

			const { Item } = await ddbClient.send(new GetItemCommand(params));

			if (!Item) {
				throw new Error(`Order not found`);
			}

			return unmarshall(Item);
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async createOrder(checkoutEvent) {
		console.log(`creating order, event : "${checkoutEvent}"`);

		try {
			const orderDate = new Date().toISOString();
			checkoutEvent.orderDate = orderDate;

			const params = {
				TableName: process.env.DYNAMODB_TABLE_NAME!,
				Item: marshall(checkoutEvent),
			};

			const createResult = await ddbClient.send(new PutItemCommand(params));

			return createResult;
		} catch (e) {
			return handleError(e);
		}
	}
}

module.exports = new OrderTable();
