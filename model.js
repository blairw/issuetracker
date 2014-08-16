var singletonData = [];
var singletonUniqueDates = [];

var singletonSelectedUUID = "";
var singletonSelectedDate = "";
var singletonSelectedUpdate = "";

var MONTHS = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/*
 * CRUD functions
 */
function createItem(myUUID, myTitle, myDescription, myUpdates) {
	var newObject = {
		uuid: myUUID,
		title: myTitle,
		description: myDescription,
		updates: myUpdates
	}
	singletonData.push(newObject);
}
function readItemByUUID(selectedUUID) {
	var returnItem = -1;
	for (i = 0; i < singletonData.length; i++) {
		if (singletonData[i].uuid == selectedUUID) {
			returnItem = singletonData[i];
		}
	}
	
	return returnItem;
}
function readItemIndexInArrayByUUID(uuid) {
	var index = -1;
	for (i = 0; i < singletonData.length; i++) {
		if (singletonData[i].uuid == uuid) {
			index = i;
		}
	}
	
	return index;
}
function updateItemByUUID(myUUID, myTitle, myDescription) {
	var index = -1;
	for (i = 0; i < singletonData.length; i++) {
		if (singletonData[i].uuid == myUUID) {
			index = i;
		}
	}
	
	if (index != -1) {
		singletonData[index].title = myTitle;
		singletonData[index].description = myDescription;
	}
}


function compareDateObjects(date1, date2) {
	returnValue = 0;
	if (date1.getMilliseconds() < date2.getMilliseconds()) {
		returnValue = -1;
	} else if (date1.getMilliseocnds() > date2.getMilliseconds()) {
		returnValue = 1;
	}
	return returnValue;
}

function compareItemsByTitle(item1, item2) {
	returnValue = 0;
	if (item1.title < item2.title) {
		returnValue = -1;
	} else if (item1.title > item2.title) {
		returnValue = 1;
	}
	return returnValue;
}

function compareItemsByAge(item1, item2) {
	returnValue = 0;
	
	varItem1oldestTime = item1.updates[0].timestamp;
	varItem2oldestTime = item2.updates[0].timestamp;
	for (i = 0; i < item1.updates.length; i++) {
		if (compareTwoDates(item1.updates[i].timestamp, varItem1oldestTime) == -1) {
			varItem1oldestTime = item1.updates[i].timestamp;
		}
	}
	for (i = 0; i < item2.updates.length; i++) {
		if (compareTwoDates(item2.updates[i].timestamp, varItem2oldestTime) == -1) {
			varItem2oldestTime = item2.updates[i].timestamp;
		}
	}
	
	returnValue = compareTwoDates(varItem1oldestTime, varItem2oldestTime);
	
	return returnValue;
}

function compareItemsByAgeReversed(item1, item2) {
	return compareItemsByAge(item1, item2) * -1;
}

function compareItemsByLastUpdate(item1, item2) {
	returnValue = 0;
	
	varItem1newestTime = item1.updates[0].timestamp;
	varItem2newestTime = item2.updates[0].timestamp;
	for (i = 0; i < item1.updates.length; i++) {
		if (
			compareTwoDates(item1.updates[i].timestamp, varItem1newestTime) == 1
		) {
			varItem1newestTime = item1.updates[i].timestamp;
		}
	}
	for (i = 0; i < item2.updates.length; i++) {
		if (
			compareTwoDates(item2.updates[i].timestamp, varItem2newestTime) == 1
		) {
			varItem2newestTime = item2.updates[i].timestamp;
		}
	}
	
	returnValue = compareTwoDates(varItem1newestTime, varItem2newestTime);
	
	return returnValue;
}

function compareItemsByLastUpdateReversed(item1, item2) {
	return compareItemsByLastUpdate(item1, item2) * -1;
}

// http://stackoverflow.com/questions/2698725/comparing-date-part-only-without-comparing-time-in-javascript
function compareTwoDates(date1in, date2in) {
	var date1 = getJustTheDate(date1in);
	var date2 = getJustTheDate(date2in);
	if (
		date1.getTime() < date2.getTime()
	) {
		return -1;
	} else if (
		date1.getTime() > date2.getTime()
	) {
		return 1;
	} else {
		return 0;
	}
}

function getJustTheDate(datetimeObject) {
	var outputObject = new Date(datetimeObject);
	outputObject.setHours(0,0,0,0);
	return outputObject;
}

function uniqueDaysFromData() {
	for (i = 0; i < singletonData.length; i++) {
		for (j = 0; j < singletonData[i].updates.length; j++) {
			var thisTimestamp = singletonData[i].updates[j].timestamp;
			var alreadyExists = false;
			
			for (k = 0; k < singletonUniqueDates.length; k++) {
				// look for matches
				if (
					compareTwoDates(singletonUniqueDates[k], thisTimestamp) == 0
				) {
					alreadyExists = true;
				}
			}
			
			if (!alreadyExists) {
				// no match found
				singletonUniqueDates.push(thisTimestamp);
			}
		}
	}
	singletonUniqueDates.sort(compareTwoDates);
}

// http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

function niceDateString(d) {
	var tz = d.getTimezoneOffset()/(-60)
	return  d.getFullYear().toString().substring(2,4) + "." + pad(d.getMonth(),2) + "." + pad(d.getDate(),2)
		+ " " + pad(d.getHours(),2) + ":" + pad(d.getMinutes(),2) + ":" + pad(d.getSeconds(),2)
		+ " utc" + (tz < 0 ? "-"+tz : "+"+tz);
}

function generateValidFilename(stringInput) {
	// replace nasty characters
	var replaceChar = "_";
	var regEx = new RegExp('[,/\:*$?""<> |]', 'g');
	var filename = stringInput.replace(regEx, replaceChar);
	filename = filename.replace(/'/g, replaceChar);
	
	// remove opening dots
	while (filename[0] == ".") {
		filename = filename.substring(1);
	}
	
	// lowercase
	filename = filename.toLowerCase();
	
	return filename;
}
