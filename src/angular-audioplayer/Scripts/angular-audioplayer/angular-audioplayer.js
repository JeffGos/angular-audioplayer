angular.module('angularAudioPlayer', [])
	.service('audioPlayerService', AudioPlayerService)
	.directive('audioPlayerControl', ['$interval', '$document', 'audioPlayerService', AudioPlayerControl])
	.directive('audioVolumeControl', ['$interval', '$document', 'audioPlayerService', AudioVolumeControl]);