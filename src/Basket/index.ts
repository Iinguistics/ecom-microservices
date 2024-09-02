import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
const BasketTable = require('./Services/BasketTable');
const handleError = require('../utils/handleError');

export async function main(
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
	console.log('request:', JSON.stringify(event, undefined, 2));

	const httpMethod = event.httpMethod;
	const userName = event.pathParameters?.userName;
	let body;

	try {
		switch (httpMethod) {
			case 'GET':
				if (userName) {
					body = await BasketTable.getBasket(userName); // GET /basket/{userName}
				} else {
					body = await BasketTable.getAllBaskets(); // GET /basket
				}
				break;
			case 'POST':
				if (event.path == '/basket/checkout') {
					body = await BasketTable.checkoutBasket(event); // POST /basket/checkout
				} else {
					body = await BasketTable.createBasket(event); // POST /basket
				}
				break;
			case 'DELETE':
				body = await BasketTable.deleteBasket(userName); // DELETE /basket/{userName}
				break;
			default:
				throw new Error(`Unsupported route: "${httpMethod}"`);
		}

		console.log(body);
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: `Successfully finished operation: "${httpMethod}"`,
				body,
			}),
		};
	} catch (error: unknown) {
		console.error(error);

		return handleError(error);
	}
}
