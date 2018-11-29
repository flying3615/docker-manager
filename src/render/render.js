
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
					// remove mask
					$('#mask').remove();
					break
				case 'inspect':
					$('.modal-body')[0].innerText = JSON.stringify(value.res, null, 2)
					break
				case 'list-all':
					containersResult = value.res
					listAllResultHandler(value.res)
					break
			}
		})
		.on('error', (event, error) => {
			$('#errorMsg').innerText = error.msg
			$('.alert').alert()
		});

  function listAllResultHandler(result) {
		$('#tbody').empty()
		result.sort((a, b) => a.State > b.State ? -1 : a.State < b.State ? 1 : 0)
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
		const state_cls = rowData.includes('running') ? 'btn-danger' : 'btn-success';
    const startStopBtn = $(`<td><button class="btn ${state_cls} startStopBtn_${containerId}">${state}</button></td>`);
    newRow.append(startStopBtn)
    tbody.append(newRow)

		//start-stop
		newRow.on('click', `.startStopBtn_${containerId}`, function () {
			// show mask...
			console.log(`click ${containerId}`)
			maskPage()
      ipcRenderer.send('exe', { action: 'start-stop', id: containerId, cmd: this.innerText });
    });

    return newRow;
  }

  // trigger to show container detail
	$('#exampleModalCenter').on('shown.bs.modal', function (e) {
		const invoker = $(e.relatedTarget)
			ipcRenderer.send('exe', { action: 'inspect', id: invoker.attr('id')});
	})


	function maskPage() {
		const maskDiv = $("<div class=\"row h-100 justify-content-center align-items-center\" id='mask'><i class=\"fa fa-circle-o-notch fa-spin\" style=\"font-size:48px;z-index: 11;color: white\"></i></div>")
		maskDiv.css({"opacity":"0.5",
			"background-color": "#000",
			"position":"fixed",
			"width":"100%",
			"height":"100%",
			"top":"0px",
			"left":"0px",
			"z-index":"10"})
		$('body').append(maskDiv)
	}


});
