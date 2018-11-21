// require('../../resources/semantic.min.js')

const {
    ipcRenderer,
} = require('electron');

$(document).ready(() => {
  const asyncBtn = document.getElementById('asynBtn');
  const containers = $('#containers');

  asyncBtn.addEventListener('click', () => {
    ipcRenderer.send('checkhealth', 'local_sports-db_1');
  });

  ipcRenderer
        .on('exe-reply', (event, value) => {
          console.log(value);

          switch (value.action){
            case 'start-stop':
              // TODO
              break
            case 'list-all':
							listAllResultHandler(value.res)
              break
          }


        });

  function listAllResultHandler(result) {
		result.sort((a, b) => a.State > b.State) //TODO not working...
			.forEach((element) => {
				console.log(value);
				const networkObj = element.NetworkSettings.Networks;
				const IPAddress = networkObj[Object.keys(networkObj)[0]].IPAddress;
				const ports = element.Ports.map(p => p.PrivatePort).join(',');

				_insertTableRow(containers, [element.Names[0], IPAddress, ports, element.State, element.Status], 0, element.Id);
			});
  }


  function _insertTableRow(table, rowData, index, containerId) {
    const newRow = $('<tr/>').insertAfter(table.find('tr').eq(index));
    $(rowData).each(function (colIndex) {
      newRow.append($('<td/>').text(this));
    });
    console.log('containerId', containerId);
    const state = rowData.includes('running') ? 'stop' : 'start';
    const button = $(`<button id=${containerId}>${state}</button>`);
    newRow.append(button);
    $('#containers').on('click', `#${containerId}`, function () {
      console.log(`${this.id} ${this.innerText}`);
      ipcRenderer.send('exe', { id: this.id, cmd: this.innerText });
    });
    return newRow;
  }
});
