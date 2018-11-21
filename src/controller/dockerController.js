import { sendData } from '../index';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {
    ipcMain,
} = require('electron');

class DockerController {

  constructor() {
    this.init();
  }

  init() {
    ipcMain
        .on('exe', (event, val) => {
					this.containerExecutor('POST', `http:/containers/${val.id}/${val.cmd}`)
            .then(res=>{sendData('exe-reply', {action:'start-stop', res})})
        });


    this.containerExecutor('GET', 'http:/containers/json?all=1').then((res) => {
      sendData('exe-reply', {action:'list-all', res});
    }).catch((e) => {
      sendData('exe-reply', e);
    });
  }

  async check(name) {
        // await exec(`docker restart ${name}`);
    try {
      const cmd = `docker ps -f "health=healthy"|grep -c ${name}`;
      const {
                stdout,
                stderr,
            } = await exec(cmd);
      console.log(`doning the healthy check result=${stdout}`);
      console.log(`doning the healthy check error=${stderr}`);
      return stdout;
    } catch (err) {
      console.log(`happen  error ${err}`);
      return err;
    }
  }


  async startStopContainer(id,cmd) {
		try {
			const cmd = `curl --unix-socket /var/run/docker.sock -X POST http:/containers/${id}/${cmd}`;
			const {
				stdout,
				stderr,
			} = await exec(cmd);
			const jsonResult = JSON.parse(stdout);
			console.log(`doning the containers check result=${stdout}`);
			console.log(`doning the containers check error=${stderr}`);
			return jsonResult;
		} catch (err) {
			console.log(`happen  error ${err}`);
			return err;
		}
  }

  async containerExecutor(method, url) {
		try {
			const cmd = `curl --unix-socket /var/run/docker.sock -X ${method} ${url}`;
			const {
				stdout,
				stderr,
			} = await exec(cmd);
			const jsonResult = JSON.parse(stdout);
			console.log(`doning the containers check result=${stdout}`);
			console.log(`doning the containers check error=${stderr}`);
			return jsonResult;
		} catch (err) {
			console.log(`happen  error ${err}`);
			return err;
		}
  }

}

module.exports = DockerController;
