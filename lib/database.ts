import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import {
	AttributeType,
	BillingMode,
	ITable,
	Table,
} from 'aws-cdk-lib/aws-dynamodb';

export class Database extends Construct {
	public readonly basketTable: ITable;
	public readonly productTable: ITable;
	public readonly orderTable: ITable;

	constructor(scope: Construct, id: string) {
		super(scope, id);

		this.basketTable = this.createBasketTable();
		this.productTable = this.createProductTable();
		this.orderTable = this.createOrderTable();
	}

	private createBasketTable(): ITable {
		const basketTable = new Table(this, 'basket', {
			partitionKey: {
				name: 'userName',
				type: AttributeType.STRING,
			},
			tableName: 'basket',
			removalPolicy: RemovalPolicy.DESTROY,
			billingMode: BillingMode.PAY_PER_REQUEST,
		});
		return basketTable;
	}

	private createProductTable(): ITable {
		const productTable = new Table(this, 'product', {
			partitionKey: {
				name: 'id',
				type: AttributeType.STRING,
			},
			tableName: 'product',
			removalPolicy: RemovalPolicy.DESTROY,
			billingMode: BillingMode.PAY_PER_REQUEST,
		});
		return productTable;
	}

	private createOrderTable(): ITable {
		const orderTable = new Table(this, 'order', {
			partitionKey: {
				name: 'userName',
				type: AttributeType.STRING,
			},
			sortKey: {
				name: 'orderDate',
				type: AttributeType.STRING,
			},
			tableName: 'order',
			removalPolicy: RemovalPolicy.DESTROY,
			billingMode: BillingMode.PAY_PER_REQUEST,
		});
		return orderTable;
	}
}
