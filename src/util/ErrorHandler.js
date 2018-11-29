import {sendData} from '../index';

class ErrorHandler {

	static sendError(e) {
		sendData('error', {action: e.action, msg: e})
	}

}

module.exports = ErrorHandler;