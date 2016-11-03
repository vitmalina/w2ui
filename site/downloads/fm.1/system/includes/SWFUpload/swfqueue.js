function jsQueue_class() {
	this.size_total		= 0
	this.size_current 	= 0;
	this.files 	 		= [];
	this.current 		= 0;
	
	this.clear = function() { 
		this.size_total   = 0; 
		this.size_current = 0;
		this.files = []; 
	}
	this.add = function(file) {
		this.files[this.files.length] = file;
		this.size_total += parseInt(file.size);		
	}
}
var queue = new jsQueue_class();

function fileQueued(file) {
	//tmp = ''; for(f in file) tmp += f+': '+file[f]+'\n'; alert(tmp);
	queue.add(file);
}

function fileQueueError(file, errorCode, message) {
	try {
	switch (errorCode) {
		case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
			alert("You have attempted to queue too many files.\n" + (message === 0 ? "You have reached the upload limit." : "You may select " + (message > 1 ? "up to " + message + " files." : "one file.")));
			break;
		case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
			alert("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
			alert("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
			alert("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		default:
			alert("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
	}
	} catch(e) {}
}

function fileDialogComplete(numFilesSelected, numFilesQueued) {
	if (numFilesQueued > 0) {
		this.startUpload();
		queue.current = 1;
	}
}

function uploadStart(file) {
	return true;
}

function uploadProgress(file, bytesLoaded, bytesTotal) {
	var percent = Math.ceil(((parseInt(queue.size_current) + parseInt(bytesLoaded)) / queue.size_total) * 100);
	var el = document.getElementById('fprogress');
	var html = '<div style="width: 120px; height: 13px; border: 1px solid silver; padding: 1px;">'+
		'<div style="float: left; width: '+ percent +'%; background-color: #439df7;">&nbsp;</div>'+
		'</div>';
	if (el) el.innerHTML = 'Uploading: '+ percent +'%';
	if (el) el.innerHTML = html;
}

function uploadSuccess(file, serverData) {
	//tmp = ''; for(f in file) tmp += f+': '+file[f]+'\n'; alert(tmp);
	top.tmp_serverData = serverData;
	queue.size_current = queue.size_current + parseInt(file.size);
}

function uploadError(file, errorCode, message) {
	try {
	switch (errorCode) {
		case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
			alert("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
			alert("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.IO_ERROR:
			alert("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
			alert("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
			alert("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
			alert("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
			alert('Uplaod canceled');
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
			alert("Stopped");
			break;
		default:
			alert("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
    }
	} catch(e) {}

}

function uploadComplete(file) {
	if (queue.files.length > queue.current) {
		this.startUpload(queue.files[queue.current].id);
		queue.current++;
	} else {
		var el = document.getElementById('fprogress');
		if (el) el.innerHTML = '';
		eval(top.tmp_serverData);
		if (top.tmp_uploadFinished != '') eval(top.tmp_uploadFinished);
	}
}
