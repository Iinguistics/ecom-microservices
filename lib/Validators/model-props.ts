import {
	LambdaRestApi,
	JsonSchemaType,
	JsonSchemaVersion,
	ModelProps,
} from 'aws-cdk-lib/aws-apigateway';

export const getBasketProps = (restApi: LambdaRestApi): ModelProps => {
	return {
		restApi,
		contentType: 'application/json',
		modelName: 'BasketModel',
		schema: {
			schema: JsonSchemaVersion.DRAFT4,
			type: JsonSchemaType.OBJECT,
			required: ['userName', 'paymentMethod', 'items'],
			properties: {
				userName: { type: JsonSchemaType.STRING },
				paymentMethod: { type: JsonSchemaType.STRING },
				items: { type: JsonSchemaType.ARRAY },
			},
		},
	};
};

export const getProductProps = (restApi: LambdaRestApi): ModelProps => {
	return {
		restApi,
		contentType: 'application/json',
		modelName: 'ProductModel',
		schema: {
			schema: JsonSchemaVersion.DRAFT4,
			type: JsonSchemaType.OBJECT,
			required: [
				'category',
				'description',
				'name',
				'price',
			],
			properties: {
				category: { type: JsonSchemaType.STRING },
				description: { type: JsonSchemaType.STRING },
				name: { type: JsonSchemaType.STRING },
				price: { type: JsonSchemaType.NUMBER },
			},
		},
	};
};
