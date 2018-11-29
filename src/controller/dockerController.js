import {sendData} from '../index';
import * as ErrorHandler from "../util/ErrorHandler";

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {
	ipcMain,
} = require('electron');

class DockerController {

	constructor() {
		this.init()
	}

	init() {
		ipcMain
			.on('exe', (event, val) => {
				switch (val.action) {
					case 'start-stop':
						DockerController.containerExecutor('POST', `http:/containers/${val.id}/${val.cmd}`)
							.then(res => {
								sendData('exe-reply', {action: val.action, res})
								this.loadStates()
							})
							.catch(e => {
								ErrorHandler.sendError({action: val.action, msg: e})
							})
						break
					case 'inspect':
						DockerController.containerExecutor('GET', `http:/containers/${val.id}/json`)
							.then(res => {
								sendData('exe-reply', {action: val.action, res})
							})
							.catch(e => {
								ErrorHandler.sendError({action: val.action, msg: e})
							})
				}
			})
			.on('refresh', () => {
				this.loadStates()
			})

		this.loadStates()
	}


	loadStates() {
		DockerController.containerExecutor('GET', 'http:/containers/json?all=1').then((res) => {
			sendData('exe-reply', {action: 'list-all', res});
		}).catch((e) => {
			sendData('exe-reply', {action: 'list-all', res: e});
		});
	}


	static async containerExecutor(method, url) {
		try {
			const cmd = `curl --unix-socket /var/run/docker.sock -X ${method} ${url}`;
			console.log('Command ', cmd)
			const {
				stdout,
				stderr,
			} = await exec(cmd);

			// console.log(`stdout=${stdout}`);
			console.log(`stderr=${stderr}`);

			return JSON.parse(stdout || '{}');
		} catch (err) {
			throw Error(err)
		}
	}

}

module.exports = DockerController;
