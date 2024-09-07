import { EventBus as EB, Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { IQueue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import ebOptions from './config/eb';

interface EventBusProps {
	orderQueue: IQueue;
}

export class EventBus extends Construct {
	constructor(scope: Construct, id: string, props: EventBusProps) {
		super(scope, id);

		const bus = new EB(this, 'EventBus', {
			eventBusName: 'EventBus',
		});

		const checkoutBasketRule = new Rule(this, ebOptions.checkout.ruleName, {
			eventBus: bus,
			enabled: true,
			description: ebOptions.checkout.description,
			eventPattern: {
				source: [ebOptions.checkout.source],
				detailType: [ebOptions.checkout.detailType],
			},
			ruleName: ebOptions.checkout.ruleName,
		});

		checkoutBasketRule.addTarget(new SqsQueue(props.orderQueue));
	}
}
