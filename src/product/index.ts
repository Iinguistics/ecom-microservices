import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
const handleError = require('../utils/handleError');
const ProductTable = require('./Service/ProductTable');

export async function main(
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
	console.log('request:', JSON.stringify(event, undefined, 2));

	const httpMethod = event.httpMethod;
	let body;

	try {
		switch (httpMethod) {
			case 'GET':
				if (event.queryStringParameters) {
					body = await ProductTable.getProductsByCategory(event); // GET product/1234?category=Phone
				} else if (event.pathParameters?.id) {
					body = await ProductTable.getProduct(event.pathParameters.id); // GET product/{id}
				} else {
					body = await ProductTable.getAllProducts(); // GET products
				}
				break;
			case 'POST':
				body = await ProductTable.createProduct(event); // POST /product
				break;
			case 'DELETE':
				body = await ProductTable.deleteProduct(event.pathParameters?.id); // DELETE /product/{id}
				break;
			case 'PUT':
				body = await ProductTable.updateProduct(event); // PUT /product/{id}
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
