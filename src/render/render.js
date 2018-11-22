
const {
    ipcRenderer,
} = require('electron');

$(document).ready(() => {
  const refreshBtn = document.getElementById('refresh');
  const containers = $('#containers');


	refreshBtn.addEventListener('click', () => {
		ipcRenderer.send('refresh');
	});

  ipcRenderer
        .on('exe-reply', (event, value) => {
          console.log(value);

          switch (value.action){
						case 'start-stop':
              // TODO, hide blocker
							console.log('start-stop return...')
              break
            case 'list-all':
							listAllResultHandler(value.res)
              break
          }
        });

  function listAllResultHandler(result) {
		$('#tbody').empty()
		result.sort((a, b) => a.State > b.State ? 1 : a.State < b.State ? -1 : 0) //TODO not working...
			.forEach((element, index) => {
				const networkObj = element.NetworkSettings.Networks;
				const IPAddress = networkObj[Object.keys(networkObj)[0]].IPAddress;
				const ports = element.Ports.map(p => p.PrivatePort).join(',');

				_insertTableRow($('#tbody'), [element.Names[0], IPAddress, ports, element.State, element.Status], ++index, element.Id);
			});
  }


  function _insertTableRow(tbody, rowData, index, containerId) {
		const newRow = $('<tr/>')
		newRow.append($('<th scope="row"/>').text(index));
		$(rowData).each(function (colIndex) {
      newRow.append($('<td/>').text(this));
    });
    const state = rowData.includes('running') ? 'stop' : 'start';
    const button = $(`<button id=${containerId}>${state}</button>`);
    newRow.append(button)
    tbody.append(newRow)
    $('#containers').on('click', `#${containerId}`, function () {
      console.log(`${this.id} ${this.innerText}`);
			//TODO enable blocker...
      ipcRenderer.send('exe', { id: this.id, cmd: this.innerText });
    });
    return newRow;
  }
});
