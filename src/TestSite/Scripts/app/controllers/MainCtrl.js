function MainCtrl($scope, audioPlayer) {
	$scope.setAudioPlayerSource = function(source) {
		audioPlayer.setTrackSource(source);
	}
}