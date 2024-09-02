import {
	LambdaRestApi,
	Model,
	RequestValidator,
	MethodOptions,
	LambdaIntegration,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { getProductProps } from './Validators/model-props';

interface ApiGatewayProps {
	productMicroservice: IFunction;
}

export class ApiGateway extends Construct {
	constructor(scope: Construct, id: string, props: ApiGatewayProps) {
		super(scope, id);

		this.createProductApi(props.productMicroservice);
	}

	private createProductApi(productMicroservice: IFunction) {
		const restApi = new LambdaRestApi(this, 'productApi', {
			restApiName: 'Product Service',
			handler: productMicroservice,
			proxy: false,
		});

		const productModel = new Model(
			this,
			'ProductModel',
			getProductProps(restApi)
		);

		const requestValidator = new RequestValidator(this, 'RequestValidator', {
			restApi,
			validateRequestBody: true,
			validateRequestParameters: false,
		});

		const methodOptions: MethodOptions = {
			requestModels: {
				'application/json': productModel,
			},
			requestValidator,
		};

		const product = restApi.root.addResource('product');
		product.addMethod('GET'); // GET /product
		product.addMethod(
			'POST',
			new LambdaIntegration(productMicroservice),
			methodOptions
		); // POST /product

		const singleProduct = product.addResource('{id}'); // product/{id}
		singleProduct.addMethod('GET'); // GET /product/{id}
		singleProduct.addMethod(
			'PUT',
			new LambdaIntegration(productMicroservice),
			methodOptions
		); // PUT /product/{id}
		singleProduct.addMethod('DELETE'); // DELETE /product/{id}
	}
}
