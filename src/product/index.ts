import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
	DeleteItemCommand,
	GetItemCommand,
	PutItemCommand,
	UpdateItemCommand,
	QueryCommand,
	ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { ddbClient } from './ddbClient';

export async function main(
	event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
	console.log('event', event);

	return {
		body: JSON.stringify({ message: 'Successful lambda invocation' }),
		statusCode: 200,
	};
}
