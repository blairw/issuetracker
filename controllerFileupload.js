function startRead() {
	var file = document.getElementById('file').files[0];
	var readFileName = escape(file.name).substring(0, file.name.lastIndexOf('.json'));
	
	// update into singleton variable and also document title
	document.getElementById("inputDocumentTitle").value = readFileName;
	document.title = readFileName + ".json";
	
	if(file){
		getAsText(file);
	}
}

function getAsText(readFile) {
	var reader = new FileReader();

	// Read file into memory as UTF-16      
	reader.readAsText(readFile, "UTF-8");

	// Handle progress, success, and errors
	reader.onload = loaded;
	reader.onerror = errorHandler;
}

function loaded(evt) {  
	// Obtain the read file data    
	var fileString = evt.target.result;
	var objects = JSON.parse(fileString);
	for (i = 0; i < objects.length; i++) {
		for (j = 0; j < objects[i].updates.length; j++) {
			objects[i].updates[j].timestamp = new Date(objects[i].updates[j].timestamp);
		}
		createItem(objects[i].uuid, objects[i].title, objects[i].description, objects[i].updates);
	}
	
	// sort alpha order
	// singletonData.sort(compareItemsByTitle);
	singletonData.sort(compareItemsByLastUpdateReversed);
	drawTable();
	var file = document.getElementById('file').value = "";
	$('#divModalUpload').modal('hide');
	
	document.getElementById("buttonUpload").disabled = true;
	document.getElementById("buttonSave").disabled = false;
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
	// The file could not be read
	}
}
