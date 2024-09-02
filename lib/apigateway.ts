import {
	LambdaRestApi,
	Model,
	RequestValidator,
	MethodOptions,
	LambdaIntegration,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { getBasketProps, getProductProps } from './Validators/model-props';

interface ApiGatewayProps {
	basketMicroservice: IFunction;
	productMicroservice: IFunction;
}

export class ApiGateway extends Construct {
	constructor(scope: Construct, id: string, props: ApiGatewayProps) {
		super(scope, id);

		this.createBasketApi(props.basketMicroservice);
		this.createProductApi(props.productMicroservice);
	}

	private createBasketApi(basketMicroservice: IFunction) {
		const restApi = new LambdaRestApi(this, 'basketApi', {
			restApiName: 'Basket Service',
			handler: basketMicroservice,
			proxy: false,
		});

		const basketModel = new Model(this, 'BasketModel', getBasketProps(restApi));

		const requestValidator = new RequestValidator(
			this,
			'BasketRequestValidator',
			{
				restApi,
				validateRequestBody: true,
			}
		);

		const methodOptions: MethodOptions = {
			requestModels: {
				'application/json': basketModel,
			},
			requestValidator,
		};

		const basket = restApi.root.addResource('basket');
		basket.addMethod('GET'); // GET /basket
		basket.addMethod(
			'POST',
			new LambdaIntegration(basketMicroservice),
			methodOptions
		); // POST /basket

		const singleBasket = basket.addResource('{userName}');
		singleBasket.addMethod('GET'); // GET /basket/{userName}
		singleBasket.addMethod('DELETE'); // DELETE /basket/{userName}

		const basketCheckout = basket.addResource('checkout');
		basketCheckout.addMethod('POST'); // POST /basket/checkout
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

		const requestValidator = new RequestValidator(
			this,
			'ProductRequestValidator',
			{
				restApi,
				validateRequestBody: true,
			}
		);

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
