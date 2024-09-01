import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { handleError } from '../utils/handleError';
import ProductTable  from './Service/ProductTable'

export async function main(
	event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
	console.log('request:', JSON.stringify(event, undefined, 2));

	const httpMethod = event.requestContext.http.method;
	let body;

	try {
		switch (httpMethod) {
			case 'GET':
				if (event.queryStringParameters) {
					body = await getProductsByCategory(event); // GET product/1234?category=Phone
				} else if (event.pathParameters?.id) {
					body = await ProductTable.getProduct(event.pathParameters.id); // GET product/{id}
				} else {
					body = await ProductTable.getAllProducts() // GET products
				}
				break;
			case 'POST':
				body = await createProduct(event); // POST /product
				break;
			case 'DELETE':
				body = await deleteProduct(event.pathParameters?.id); // DELETE /product/{id}
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
				body: body,
			}),
		};
	} catch (error: unknown) {
		console.error(error);

		return handleError(error);
	}
}
