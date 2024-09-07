import type {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	SQSEvent,
} from 'aws-lambda';
const handleError = require('../utils/handleError');
const OrderTable = require('./Service/OrderTable');

export async function main(
	event: APIGatewayProxyEvent | SQSEvent
): Promise<APIGatewayProxyResult | void> {
	console.log('request:', JSON.stringify(event, undefined, 2));

	// @ts-ignore checks both event cases
	if (event.Records) {
		// @ts-ignore
		await sqsInvocation(event);
	} else {
		// @ts-ignore
		return await apiGatewayInvocation(event);
	}
}

const sqsInvocation = async (event: SQSEvent) => {
	event.Records.forEach(async (record) => {
		const checkoutEventRequest = JSON.parse(record.body);

		await OrderTable.createOrder(checkoutEventRequest.detail);
	});
};

const apiGatewayInvocation = async (event: APIGatewayProxyEvent) => {
	let body;
	const httpMethod = event.httpMethod;

	try {
		switch (httpMethod) {
			case 'GET':
				if (event.pathParameters) {
					body = await OrderTable.getOrder(event);
				} else {
					body = await OrderTable.getAllOrders();
				}
				break;
			default:
				throw new Error(`Unsupported route: "${httpMethod}"`);
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: `Successfully finished operation: "${httpMethod}"`,
				body,
			}),
		};
	} catch (e) {
		console.error(e);
		return handleError(e);
	}
};
