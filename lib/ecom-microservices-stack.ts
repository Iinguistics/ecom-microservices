import * as cdk from 'aws-cdk-lib';
import { ApiGateway } from './apigateway';
import { Construct } from 'constructs';
import { Database } from './database';
import { EventBus } from './eventbus';
import { Microservices } from './microservice';
import { Queue } from './queue';

export class EcomMicroservicesStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const database = new Database(this, 'Database');

		const microservices = new Microservices(this, 'Microservices', {
      basketTable: database.basketTable,
			productTable: database.productTable,
      orderTable: database.orderTable,
		});

		const apigateway = new ApiGateway(this, 'ApiGateway', {
      basketMicroservice: microservices.basketMicroservice,
			productMicroservice: microservices.productMicroservice,
      orderMicroservice: microservices.orderMicroservice,
		});

    const queue = new Queue(this, 'Queue', {
      consumer: microservices.orderMicroservice
    });

    const eventbus = new EventBus(this, 'EventBus', {
      orderQueue: queue.orderQueue   
    });   
	}
}
