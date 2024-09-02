const { ebClient } = require('./ebClient');
const { PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const handleError = require('../../utils/handleError');

class BasketEventBridge {
	async publishCheckoutBasketEvent(checkoutPayload) {
		console.log('publishCheckoutBasketEvent with payload:', checkoutPayload);
		try {
			const params = {
				Entries: [
					{
						Source: process.env.EVENT_SOURCE,
						Detail: JSON.stringify(checkoutPayload),
						DetailType: process.env.EVENT_DETAIL_TYPE,
						Resources: [],
						EventBusName: process.env.EVENT_BUS_NAME,
					},
				],
			};

			const data = await ebClient.send(new PutEventsCommand(params));

			console.log('event sent data:', data);
			return data;
		} catch (e) {
			return handleError(e);
		}
	}
}

module.exports = new BasketEventBridge();
