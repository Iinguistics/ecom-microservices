import CatchError from "./CatchError";

export const handleError = (error: unknown): CatchError => {
	let errorMsg = 'Unknown error';
	let errorStack = '';

	if (error instanceof Error) {
		errorMsg = error.message;
		errorStack = error.stack || errorStack;
	}

	return {
		statusCode: 500,
		body: JSON.stringify({
			message: 'Failed to perform operation.',
			errorMsg,
			errorStack,
		}),
	};
};
