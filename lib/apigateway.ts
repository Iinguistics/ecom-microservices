import {
	LambdaRestApi,
	Model,
	RequestValidator,
	JsonSchemaType,
	JsonSchemaVersion,
	MethodOptions,
	LambdaIntegration,
} from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface ApiGatewayProps {
	productMicroservice: IFunction;
}

export class ApiGateway extends Construct {
	constructor(scope: Construct, id: string, props: ApiGatewayProps) {
		super(scope, id);

		this.createProductApi(props.productMicroservice);
	}

	private createProductApi(productMicroservice: IFunction) {
		const apigw = new LambdaRestApi(this, 'productApi', {
			restApiName: 'Product Service',
			handler: productMicroservice,
			proxy: false,
		});

		const productModel = new Model(this, 'ProductModel', {
			restApi: apigw,
			contentType: 'application/json',
			modelName: 'ProductModel',
			schema: {
				schema: JsonSchemaVersion.DRAFT4,
				type: JsonSchemaType.OBJECT,
				required: ['category', 'description', 'name', 'price'],
				properties: {
					category: { type: JsonSchemaType.STRING },
					description: { type: JsonSchemaType.STRING },
					name: { type: JsonSchemaType.STRING },
					price: { type: JsonSchemaType.NUMBER },
				},
			},
		});

		const requestValidator = new RequestValidator(this, 'RequestValidator', {
			restApi: apigw,
			validateRequestBody: true,
			validateRequestParameters: false,
		});

		const methodOptions: MethodOptions = {
			requestModels: {
				'application/json': productModel,
			},
			requestValidator,
		};

		const product = apigw.root.addResource('product');
		product.addMethod('GET'); // GET /product
		product.addMethod('POST', new LambdaIntegration(productMicroservice), methodOptions);  // POST /product

		const singleProduct = product.addResource('{id}'); // product/{id}
		singleProduct.addMethod('GET'); // GET /product/{id}
		singleProduct.addMethod('PUT', new LambdaIntegration(productMicroservice), methodOptions); // PUT /product/{id}
		singleProduct.addMethod('DELETE'); // DELETE /product/{id}
	}
}
