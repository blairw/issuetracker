function init() {
	$('#divModalItemDetail').modal({ show: false});
	$('#divModalUpdateDetail').modal({ show: false});
	$('#divModalUpload').modal({ show: false});
	
	document.getElementById("inputNewTitle").value = "";
	document.getElementById("inputNewDescription").value = "";
	document.getElementById("inputDocumentTitle").value = "";
	drawTable();
	document.getElementById("buttonUpload").disabled = false;
	document.getElementById("buttonSave").disabled = false;
	
	$('#buttonUpload').tooltip({title:"Open/import a JSON file in your computer's filesystem", container: 'body', placement: 'bottom'}); 
	$('#buttonSave').tooltip({title:"Save/export as JSON file", container: 'body', placement: 'bottom'}); 
}

function drawTable() {
	var tableIssues = document.getElementById("tableIssues");
	
	// clear existing
	while (tableIssues.hasChildNodes()) {
		tableIssues.removeChild(tableIssues.lastChild);
	}
	
	// reprint header
	var trHeader = document.createElement("tr");
	var thHeader = document.createElement("th");
	thHeader.appendChild(document.createTextNode(""));
	trHeader.appendChild(thHeader);
	
	// print all unique dates
	uniqueDaysFromData();
	for (i = 0; i < singletonUniqueDates.length; i++) {
		var thHeaderDate = document.createElement("th");
		thHeaderDate.className = "thHeaderDate";
		if (
			compareTwoDates(singletonUniqueDates[i], new Date()) == 0
		) {
			thHeaderDate.className = "thHeaderDateToday";
		}
		thHeaderDate.appendChild(document.createTextNode(
			moment(singletonUniqueDates[i]).format("Do MMM ’YY")
		));
		trHeader.appendChild(thHeaderDate);
	}
	
	tableIssues.appendChild(trHeader);
	
	// add all singletonData
	for (i = 0; i < singletonData.length; i++) {
		var trData = document.createElement("tr");
		var tdData = document.createElement("td");
		tdData.className = 'tdIssues';
		tdData.innerHTML = '<a href="#" onclick="showModalItemDetail(\''+ singletonData[i].uuid + '\', null)">' + singletonData[i].title + " <strong>(" + singletonData[i].updates.length + ")</strong>" + '</a>';
		trData.appendChild(tdData);
		
		if (singletonData[i].updates.length > 0) {
			// there are updates
			
			for (j = 0; j < singletonUniqueDates.length; j++) {
				// go through each unique date
				
				var tdDataDate = document.createElement("td");
				for (k = 0; k < singletonData[i].updates.length; k++) {
				
					// go through each update
					if (compareTwoDates(singletonUniqueDates[j], singletonData[i].updates[k].timestamp) == 0) {
						var proposedValue = singletonData[i].updates[k].note;
						var existingClass = tdDataDate.className;
						var toBeUsedValue = null;
						
						if (existingClass == 'issueClose') {
							// if it's closed then we can't override it
						} else if (existingClass == 'issueOpen' && proposedValue == 'x') {
							// open is only overridden by close, not by continue
							toBeUsedValue = 'x';
						} else if (existingClass == 'issueOpen' && proposedValue != 'x') {
							// do nothing
						} else {
							// could be x, o, or >
							toBeUsedValue = proposedValue;
						}
						
						if (toBeUsedValue == 'o') {
							tdDataDate.className = "issueOpen";
						} else if (toBeUsedValue == '>') {
							tdDataDate.className = "issueContinue";
						} else if (toBeUsedValue == 'x') {
							tdDataDate.className = "issueClose";
						}
						
					} else {
						if (tdDataDate.innerHTML == "") {
							toBeUsedValue = ".";
							tdDataDate.className = "issueNotHere";
						}
					}
					
					if (toBeUsedValue) {
						tdDataDate.innerHTML = '<a href="#" onclick="showModalItemDetail(\''+ singletonData[i].uuid + '\', \'' + getJustTheDate(singletonUniqueDates[j]) + '\')">' + toBeUsedValue + '</a>';
					}
				}
				trData.appendChild(tdDataDate);
			}
		}
		
		tableIssues.appendChild(trData);
	}
	
}

function addNew() {
	if (document.getElementById("inputNewTitle").value != "") {
		createItem(
			generateUUID(),
			document.getElementById("inputNewTitle").value,
			document.getElementById("inputNewDescription").value,
			[ { timestamp: new Date(), note: "o" } ]
		);
		drawTable();
		document.getElementById("inputNewTitle").value = "";
		document.getElementById("inputNewDescription").value = "";
	} else {
		alert("You need to have a title.");
	}
}

function showModalItemDetail(uuid, datestring) {
	singletonSelectedUUID = uuid;
	singletonSelectedDate = datestring;
	
	var thisObject = readItemByUUID(uuid);
	document.getElementById("divModalItemDetailLabel").innerHTML = thisObject.title + (datestring ? ", <strong>" + moment(datestring).format("Do MMM ’YY") + "</strong>" : "");
	document.getElementById("modalUUID").innerHTML = uuid;
	document.getElementById("modalTitle").value = thisObject.title;
	document.getElementById("modalDescription").value = thisObject.description;
	
	var updatesText = "<tr><th>Timestamp</th><th>Note</th><th>Description</th></tr>"
		+ '<tr><td colspan="3"><button onclick="showModalUpdateDetail(\''+uuid+'\')">Add update</button></td></tr>';
		
	for (i = thisObject.updates.length - 1; i >= 0 ; i--) {
	// we want to print the objects backwards so the most recent is on top
		if (
			datestring == null // no particular day selected
			|| (datestring != null && compareTwoDates(thisObject.updates[i].timestamp, datestring) == 0) // particular day selected
		) {
			if (thisObject.updates[i].note == 'o') {
				thisClass = "danger";
			} else if (thisObject.updates[i].note == ">") {
				thisClass = "warning";
			} else if (thisObject.updates[i].note == "x") {
				thisClass = "success";
			}
			updatesText = updatesText
				+ '<tr><td style="white-space: nowrap;">'
				+ '<a href="#" onclick="showModalUpdateDetail()">' + moment(thisObject.updates[i].timestamp).format() + '</a>'
				+ '</td><td class="'+ thisClass +'" style="text-align: center; font-weight: bold;">'
				+ thisObject.updates[i].note
				+ '</td><td><div class="forceWrap">'
				+ (thisObject.updates[i].description ? thisObject.updates[i].description : "<em>No description</em>")
				+ "</div></td></tr>";
		}
	}
	document.getElementById("tableUpdates").innerHTML = updatesText;

	$('#divModalItemDetail').modal('show');
}

function showModalUpdateDetail() {
	$('#divModalItemDetail').modal('hide');
	$('#divModalUpdateDetail').modal('show');
		
	// clear for next use
	document.getElementById("mudDate").value = moment().format();
	document.getElementById("mudDescription").value = "";
	document.getElementById("mudDescription").focus();
}

function hideModalUpdateDetail() {
	$('#divModalUpdateDetail').modal('hide');
	showModalItemDetail(singletonSelectedUUID, singletonSelectedDate);
}

function showModalUpload() {
	$('#divModalUpload').modal('show');
}


function download() {
	var blob = new Blob([JSON.stringify(singletonData, null, '\t').replace(/\r?\n/g, '\r\n')], {type: "text/plain;charset=utf-8"});
	if (document.getElementById("inputDocumentTitle").value) {
		var filename = document.getElementById("inputDocumentTitle").value + ".json";
	} else {
		var filename = "untitled_issue_tracker.json";
	}
	saveAs(blob, filename);
}

function saveChanges() {
	var uuid = document.getElementById("modalUUID").innerHTML;
	var title = document.getElementById("modalTitle").value;
	var description = document.getElementById("modalDescription").value;
	
	updateItemByUUID(uuid, title, description);
	$('#divModalItemDetail').modal('hide');
	drawTable();
}

function pullDocumentTitleFromInput() {
	var documentInput = document.getElementById("inputDocumentTitle").value;
	documentInput = generateValidFilename(documentInput);
	
	// update into singleton variable and also document title
	document.getElementById("inputDocumentTitle").value = documentInput;
	document.title = documentInput + ".json";
}

function saveModalUpdateDetail() {
	console.log(singletonSelectedUUID);
	var mudDate = document.getElementById("mudDate").value;
	var mudDateObject = new Date(mudDate);
	console.log(mudDate);
	console.log(mudDateObject);
	
	var thisNote = "";
	if (mudTypeOpened.checked) {
		thisNote = "o";
	} else if (mudTypeContinue.checked) {
		thisNote = ">";
	} else if (mudTypeClosed.checked) {
		thisNote = "x";
	}
	
	var update = {
		timestamp: new Date(mudDate),
		note: thisNote,
		description: document.getElementById("mudDescription").value
	}
	
	if (update.note) {
		var index = readItemIndexInArrayByUUID(singletonSelectedUUID);
		singletonData[index].updates.push(update);
		drawTable();
		hideModalUpdateDetail();
	} else {
		alert("Aborted");
	}
}