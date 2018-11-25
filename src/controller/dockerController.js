import {sendData} from '../index';

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
						this.containerExecutor('POST', `http:/containers/${val.id}/${val.cmd}`)
							.then(res => {
								sendData('exe-reply', {action: val.action, res})
								//TODO after start-stop, reload the status, add a spinning loader
								this.loadStates()
							})
						break
					case 'inspect':
						this.containerExecutor('GET', `http:/containers/${val.id}/json`)
							.then(res => {
								sendData('exe-reply', {action: val.action, res})
							})
				}
			})
			.on('refresh',()=>{
				this.loadStates()
			})

		this.loadStates()
	}


	loadStates() {
		this.containerExecutor('GET', 'http:/containers/json?all=1').then((res) => {
			sendData('exe-reply', {action: 'list-all', res});
		}).catch((e) => {
			sendData('exe-reply', {action: 'list-all', res:e});
		});
	}


	async containerExecutor(method, url) {
		try {
			const cmd = `curl --unix-socket /var/run/docker.sock -X ${method} ${url}`;
			console.log('Command ',cmd)
			const {
				stdout,
				stderr,
			} = await exec(cmd);
			const jsonResult = JSON.parse(stdout);
			// console.log(`stdout=${stdout}`);
			// console.log(`stderr=${stderr}`);
			return jsonResult;
		} catch (err) {
			console.log(`happen  error ${err}`);
			return err;
		}
	}

}

module.exports = DockerController;
