
const {
    ipcRenderer,
} = require('electron');

$(document).ready(() => {
  const refreshBtn = $('#refresh');

  const searchInput = $('#searchStr')

	let containersResult

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

					switch (value.action) {
						case 'start-stop':
							// TODO, hide blocker
							break
						case 'inspect':

							$('.modal-body')[0].innerText = JSON.stringify(value.res, null, 2)
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

				_insertTableRow($('#tbody'), [element.Names[0].replace('/',''), ports, IPAddress, element.State, element.Status], ++index, element.Id);
			});
  }


  function _insertTableRow(tbody, rowData, index, containerId) {
		const newRow = $('<tr/>')

		const rowContent = rowData.map((ele, colIndex) => {
			if (colIndex === 0) {
				return `<td><a data-toggle="modal" data-target="#exampleModalCenter" id="${containerId}">${ele}</a></td>`
			} else {
				return `<td>${ele}</td>`
			}
		}).join();

		newRow.html(`<th scope="row">${index}</th>`+rowContent);

		const state = rowData.includes('running') ? 'stop' : 'start';
    const startStopBtn = $(`<td><button class="btn startStopBtn_${containerId}">${state}</button></td>`);
    newRow.append(startStopBtn)
    tbody.append(newRow)

		//start-stop
    $('#containers').on('click', `.startStopBtn_${containerId}`, function () {
			//TODO enable blocker...
      ipcRenderer.send('exe', { action: 'start-stop', id: containerId, cmd: this.innerText });
    });

    return newRow;
  }

	$('#exampleModalCenter').on('shown.bs.modal', function (e) {
		const invoker = $(e.relatedTarget)
			ipcRenderer.send('exe', { action: 'inspect', id: invoker.attr('id')});
	})


});
