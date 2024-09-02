import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
	NodejsFunction,
	NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

interface MicroservicesProps {
	basketTable: ITable;
	productTable: ITable;
}

export class Microservices extends Construct {
	private readonly externalModules: string[];
	public readonly basketMicroservice: NodejsFunction;
	public readonly productMicroservice: NodejsFunction;

	constructor(scope: Construct, id: string, props: MicroservicesProps) {
		super(scope, id);

		this.externalModules = ['aws-sdk'];
		this.basketMicroservice = this.createBasketFunction(props.basketTable);
		this.productMicroservice = this.createProductFunction(props.productTable);
	}

	private createBasketFunction(basketTable: ITable): NodejsFunction {
		const basketFunctionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: this.externalModules,
			},
			environment: {
				PRIMARY_KEY: 'userName',
				DYNAMODB_TABLE_NAME: basketTable.tableName,
				EVENT_SOURCE: 'com.ecom.basket.checkoutbasket',
				EVENT_DETAIL_TYPE: 'CheckoutBasket',
				EVENT_BUS_NAME: 'EventBus',
			},
			handler: 'main',
			runtime: Runtime.NODEJS_18_X,
		};

		const basketFunction = new NodejsFunction(this, 'basketLambdaFunction', {
			entry: join(__dirname, `/../src/basket/index.ts`),
			...basketFunctionProps,
		});

		basketTable.grantReadWriteData(basketFunction);
		return basketFunction;
	}

	private createProductFunction(productTable: ITable): NodejsFunction {
		const nodeJsFunctionProps: NodejsFunctionProps = {
			bundling: {
				externalModules: this.externalModules,
			},
			environment: {
				PRIMARY_KEY: 'id',
				DYNAMODB_TABLE_NAME: productTable.tableName,
			},
			handler: 'main',
			runtime: Runtime.NODEJS_18_X,
		};

		const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
			entry: join(__dirname, `/../src/product/index.ts`),
			...nodeJsFunctionProps,
		});

		productTable.grantReadWriteData(productFunction);

		return productFunction;
	}
}
