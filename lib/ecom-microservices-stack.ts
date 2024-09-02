import * as cdk from 'aws-cdk-lib';
import { ApiGateway } from './apigateway';
import { Construct } from 'constructs';
import { Database } from './database';
import { Microservices } from './microservice';

export class EcomMicroservicesStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const database = new Database(this, 'Database');

		const microservices = new Microservices(this, 'Microservices', {
      basketTable: database.basketTable,
			productTable: database.productTable,
		});

		const apigateway = new ApiGateway(this, 'ApiGateway', {
			productMicroservice: microservices.productMicroservice,
		});
	}
}
