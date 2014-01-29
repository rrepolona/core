/* global OC, FileList */
(function() {
	// override reload with own ajax call
	FileList.reload = function(){
		FileList.showMask();
		if (FileList._reloadCall){
			FileList._reloadCall.abort();
		}
		$.ajax({
			url: OC.filePath('files_trashbin','ajax','list.php'),
			data: {
				dir : $('#dir').val()
			},
			error: function(result) {
				FileList.reloadCallback(result);
			},
			success: function(result) {
				FileList.reloadCallback(result);
			}
		});
	};

	FileList._onClickBreadCrumb = function(e) {
		var $el = $(e.target).closest('.crumb'),
			index = $el.index(),
			$targetDir = $el.data('dir');
		// first one is home
		if (index === 0) {
			OC.redirect(OC.linkTo('files'));
		}
		else {
			FileList.changeDirectory($targetDir);
		}
	};

	var oldAdd = FileList.add;
	FileList.add = function(fileData, options) {
		options = options || {};
		var dir = FileList.getCurrentDirectory();
		var dirListing = dir !== '' && dir !== '/';
		if (!dirListing) {
			fileData.displayName = fileData.name;
			fileData.name = fileData.name + '.d' + fileData.timestamp;
		}
		return oldAdd.call(this, fileData, options);
	};

	// TODO download URL
	//FileList.getDownloadUrl = function(filename, dir) {
	//}

	FileList.linkTo = function(dir){
		return OC.linkTo('files_trashbin', 'index.php')+"?dir="+ encodeURIComponent(dir).replace(/%2F/g, '/');
	};

	FileList.updateEmptyContent = function(){
		var $fileList = $('#fileList');
		var exists = $fileList.find('tr:first').exists();
		$('#emptycontent').toggleClass('hidden', exists);
		$('#filestable th').toggleClass('hidden', !exists);
	};
})();
