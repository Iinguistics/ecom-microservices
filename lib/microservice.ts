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
		this.productMicroservice = this.createProductFunction(props.productTable);
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
