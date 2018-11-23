
const {
    ipcRenderer,
} = require('electron');

$(document).ready(() => {
  const refreshBtn = $('#refresh');
  const containers = $('#containers');
  const searchInput = $('#searchStr')

	let containersResult
	let inspectDetail = {}

	refreshBtn.on('click', () => {
		ipcRenderer.send('refresh');
	});

	searchInput.on('input', function () {
		let filterStr = $(this).val()
		listAllResultHandler(containersResult.filter(con =>
			con.Names[0].includes(filterStr)
		))
	})

  ipcRenderer
        .on('exe-reply', (event, value) => {
          console.log(value);

					switch (value.action) {
						case 'start-stop':
							// TODO, hide blocker
							console.log('start-stop return...', value.res)
							break
						case 'inspect':
							console.log('inspect return...', value.res)
							inspectDetail[value.res.Id] = value.res
							console.log('dropdown div ',$(`#${value.res.Name.replace('/','')}_inspect`))
							$(`#${value.res.Id}_inspect`)[0].innerText = JSON.stringify(value.res, null, 2)
							break
						case 'list-all':
							containersResult = value.res
							listAllResultHandler(value.res)
							break
          }
        });

  function listAllResultHandler(result) {
		$('#tbody').empty()
		result.sort((a, b) => a.State > b.State ? -1 : a.State < b.State ? 1 : 0) //TODO not working...
			.forEach((element, index) => {
				const networkObj = element.NetworkSettings.Networks;
				const IPAddress = networkObj[Object.keys(networkObj)[0]].IPAddress;
				const ports = element.Ports.map(p => p.PrivatePort).join(',');

				_insertTableRow($('#tbody'), [element.Names[0].replace('/',''), IPAddress, ports, element.State, element.Status], ++index, element.Id);
			});
  }


  function _insertTableRow(tbody, rowData, index, containerId) {
  	console.log('rowData = ',rowData)
		const newRow = $('<tr id="'+containerId+'"/>')
		newRow.append($('<th scope="row"/>').text(index));
		$(rowData).each(function (colIndex) {
			if(colIndex===0){
				newRow.append($(
					`<td>
						<a data-toggle="collapse" href="#${containerId}_collapse" role="link" aria-expanded="false" aria-controls="${containerId}_collapse">
						${this}
						</a>
						<div class="collapse" id="${containerId}_collapse">
						<div class="card card-body" id="${containerId}_inspect">
							${JSON.stringify(inspectDetail[containerId],null,2)}
						</div>
						</div>
					<td/>`
					));
			}else{
				newRow.append($('<td/>').text(this));
			}
    });
    const state = rowData.includes('running') ? 'stop' : 'start';
    const startStopBtn = $(`<button class="btn startStopBtn_${containerId}">${state}</button>`);

    newRow.append(startStopBtn)
    tbody.append(newRow)

		//TODO why call multiple times????
		//start-stop
    $('#containers').on('click', `.startStopBtn_${containerId}`, function () {
      console.log(`${this.id} ${this.innerText}`);
			//TODO enable blocker...
      ipcRenderer.send('exe', { action: 'start-stop', id: containerId, cmd: this.innerText });
    });

    //inspect
		$('#containers').on('show.bs.collapse', `#${containerId}_collapse`, function () {
			if(!inspectDetail[containerId]) {
				ipcRenderer.send('exe', { action: 'inspect', id: containerId});
			}
		});

    return newRow;
  }


});
