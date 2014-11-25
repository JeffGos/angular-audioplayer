function MainCtrl($scope, audioPlayerService) {
	$scope.setAudioPlayerSource = function(source) {
		audioPlayerService.setTrackSource(source);
	}
}