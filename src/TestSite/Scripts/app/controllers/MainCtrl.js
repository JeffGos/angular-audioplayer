function MainCtrl($scope, audioPlayerService) {
	$scope.setAudioPlayerSource = function (source) {
		audioPlayerService.setPlaylist([{ src: source, type: "audio/ogg" }]);
	}

	$scope.setPlaylistIndex = function (index) {
		audioPlayerService.setPlaylistIndex(index);
	}

	var playlist = [];

	playlist.push({
		src: 'http://upload.wikimedia.org/wikipedia/en/4/45/ACDC_-_Back_In_Black-sample.ogg',
		type: "audio/ogg"
	});

	playlist.push({
		src: 'http://upload.wikimedia.org/wikipedia/en/b/b5/Radiohead_-_Pyramid_Song_%28sample%29.ogg',
		type: "audio/ogg"
	});

	playlist.push({
		src: 'http://upload.wikimedia.org/wikipedia/en/9/9f/Sample_of_%22Another_Day_in_Paradise%22.ogg',
		type: "audio/ogg"
	});

	playlist.push({
		src: 'http://upload.wikimedia.org/wikipedia/en/1/1f/%22Layla%22%2C_Derek_and_the_Dominos_song_%28sample%29.ogg',
		type: "audio/ogg"
	});

	audioPlayerService.setPlaylist(playlist);
}