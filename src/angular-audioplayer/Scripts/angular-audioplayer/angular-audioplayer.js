angular.module('angularAudioPlayer', [])

.service('audioPlayer', function () {

	var self = this;

	self.isPlaying = false;
	self.player = new Audio();
	self.player.controls = false;
	setPreload("none");
	setOnPlaying(null);
	setOnPaused(null);

	return ({
		setTrackSource: setTrackSource,
		setMimeType: setMimeType,
		setPreload: setPreload,
		play: play,
		pause: pause,
		stop: stop,
		skipNext: skipNext,
		skipPrevious: skipPrevious,
		fastForward: fastForward,
		rewind: rewind,
		mute: mute,
		setVolumePercent: setVolumePercent,
		getVolumePercent: getVolumePercent,
		setProgressMs: setProgressMs,
		getProgressMs: getProgressMs,
		setProgressPercent: setProgressPercent,
		getProgressPercent: getProgressPercent,
		getDurationMs: getDurationMs,
		getIsPlaying: getIsPlaying,
		getIsMuted: getIsMuted,
		setOnTrackChanged: setOnTrackChanged,
		setOnTrackEnded: setOnTrackEnded,
		setOnVolumeChanged: setOnVolumeChanged,
		setOnPlaying: setOnPlaying,
		setOnPaused: setOnPaused
	});

	function setTrackSource(source) {
		self.player.src = source;
	}

	function setMimeType(mimeType) {
		self.player.type = mimeType;
	}

	function setPreload(preload) {
		self.player.preload = preload;
	}

	function play() {
		self.player.play();
	}

	function pause() {
		self.player.pause();
	}

	function stop() {
		pause();
		setProgressPercent(0);
	}

	function skipNext() {
		//TODO:
	}

	function skipPrevious() {
		//TODO:
	}

	function fastForward(stepMs) {
		var step = stepMs || 10000;

		self.player.currentTime += (step / 1000);
	}

	function rewind(stepMs) {
		var step = stepMs || 10000;

		self.player.currentTime -= (step / 1000);
	}

	function mute() {
		self.player.muted = !self.player.muted;
	}

	function setVolumePercent(volumePercent) {
		var vol = volumePercent / 100;

		if (vol > 1) {
			vol = 1;
		}

		if (vol < 0) {
			vol = 0;
		}

		self.player.volume = vol;
	}

	function getVolumePercent() {
		return self.player.volume * 100;
	}

	function setProgressMs(progressMs) {

		if (self.player.readyState == 0) {
			return;
		}

		self.player.currentTime = progressMs / 1000;
	}

	function getProgressMs() {
		return self.player.currentTime * 1000;
	}

	function setProgressPercent(progressPercent) {

		if (isNaN(self.player.duration)) {
			setProgressMs(0);
			return;
		}

		var progressSeconds = self.player.duration * progressPercent / 100;
		setProgressMs(progressSeconds * 1000);
	}

	function getProgressPercent() {
		return self.player.currentTime * 100 / self.player.duration;
	}

	function getDurationMs() {
		return self.player.duration * 1000;
	}

	function getIsPlaying() {
		return self.isPlaying;
	}

	function getIsMuted() {
		return player.muted;
	}

	function setOnTrackChanged(onTrackChangedListener) {
		self.player.onloadeddata = onTrackChangedListener;
	}

	function setOnTrackEnded(onTrackEndedListener) {
		self.player.addEventListener('ended', onTrackEndedListener);
	}

	function setOnVolumeChanged(onVolumeChangedListener) {
		self.player.volumechange = onVolumeChangedListener;
	}

	function setOnPlaying(onPlayingChangedListener) {
		self.player.playing = function () {

			if (onPlayingChangedListener) {
				onPlayingChangedListener();
			}

			self.isPlaying = true;
		};
	}

	function setOnPaused(onPausedChangedListener) {
		self.player.paused = function () {

			if (onPausedChangedListener) {
				onPausedChangedListener();
			}

			self.isPlaying = false;
		};
	}
})

.directive('audioPlayer', ['$interval', '$document', 'audioPlayer', function ($interval, $document, audioPlayer) {

	function link(scope, element, attrs) {

		var self = this;
		self.updateTimer = undefined;
		self.lastMouseX = 0;

		self.progressBackgroundElement = element.find("approgressbackground");
		self.progressBarElement = element.find("approgressbar");
		self.progressDraggableElement = element.find("approgressdraggable");
		self.progressDragged = false;

		self.volumeBackgroundElement = element.find("apvolumebackground");
		self.volumeBarElement = element.find("apvolumebar");
		self.volumeDraggableElement = element.find("apvolumedraggable");
		self.volumeDragged = false;

		volumeDraggableElement.on('mousedown', function (event) {
			event.preventDefault();
			self.volumeDragged = true;
			self.lastMouseX = event.pageX;

			$document.on('mousemove', self.onMouseMove);
			$document.on('mouseup', self.onMouseUp);
		});

		progressDraggableElement.on('mousedown', function (event) {
			event.preventDefault();
			self.progressDragged = true;
			self.lastMouseX = event.pageX;

			$document.on('mousemove', self.onMouseMove);
			$document.on('mouseup', self.onMouseUp);
		});

		audioPlayer.setOnTrackChanged(function () {

			self.refreshCurrentTime();
		});

		audioPlayer.setOnTrackEnded(function () { self.stop(); });
		audioPlayer.setOnVolumeChanged(function () { self.refreshVolume(); });
		audioPlayer.setOnPlaying(function () { self.play(); });
		audioPlayer.setOnPaused(function () { self.pause(); });

		element.bind('mouseenter', function () {
			scope.showCurrentTime = true;
			scope.showDuration = true;
		});

		scope.isPlaying = false;
		scope.isMuted = false;

		scope.showCurrentTime = false;
		scope.showDuration = false;

		scope.showRewind = true;
		scope.showFastForward = true;
		scope.showSkipPrevious = true;
		scope.showStop = true;
		scope.showSkipNext = true;
		scope.showVolume = true;
		scope.showDescription = true;

		scope.progressDraggablePercent = 0;
		scope.progressPercent = 0;
		scope.currentTime = 0;
		scope.duration = 0;

		scope.volumeDraggablePercent = 0;
		scope.volumePercent = 0;

		scope.currentTimeFormatted = 0;
		scope.durationFormatted = 0;
		scope.description = null;

		scope.onStopClick = function () {
			self.stop();
		}

		scope.onPlayPauseClick = function () {
			if (scope.isPlaying) {
				self.pause();
			} else {
				self.play();
			}
		}

		scope.onSkipPreviousClick = function () {
			self.stop();
			audioPlayer.skipPrevious();
		}

		scope.onSkipNextClick = function () {
			self.stop();
			audioPlayer.skipPrevious();
		}

		scope.onRewindClick = function () {
			audioPlayer.rewind();
		}

		scope.onFastForwardClick = function () {
			audioPlayer.fastForward();
		}

		scope.onMuteClick = function () {
			scope.isMuted = !scope.isMuted;
			audioPlayer.mute();
		}

		scope.onProgressBarClick = function (event) {
			var seekPercentage = (event.offsetX / event.currentTarget.offsetWidth) * 100;
			if (seekPercentage > 100) {
				seekPercentage = 100;
			}

			audioPlayer.setProgressPercent(seekPercentage);

			self.play();
		}

		scope.onVolumeBarClick = function (event) {
			var volumePercentage = (event.offsetX / event.currentTarget.offsetWidth) * 100;
			if (volumePercentage > 100) {
				volumePercentage = 100;
			}

			audioPlayer.setVolumePercent(volumePercentage);

			self.refreshVolume();
		}

		scope.$watch('src', function (newValue, oldValue) {
			if (newValue) {
				audioPlayer.setTrackSource(newValue);
			}

			self.refreshCurrentTime();
		});

		scope.$watch('preload', function (newValue, oldValue) {
			if (newValue) {
				audioPlayer.setPreload(newValue);
			}
		});

		scope.$watch('type', function (newValue, oldValue) {
			if (newValue) {
				audioPlayer.setMimeType(newValue);
			}
		});

		scope.$watch()

		scope.$on('$destroy', function () {
			//self.stop();
		});

		self.play = function () {
			scope.isPlaying = true;
			startProgressTimer();
			audioPlayer.play();
		}

		self.pause = function () {
			scope.isPlaying = false;
			stopProgressTimer();
			audioPlayer.pause();
		}

		self.stop = function () {
			scope.isPlaying = false;
			stopProgressTimer();
			audioPlayer.stop();

			refreshCurrentTime();
		}

		self.refreshCurrentTime = function () {
			scope.duration = audioPlayer.getDurationMs() / 1000;
			scope.durationFormatted = formatTime(scope.duration);

			scope.currentTime = audioPlayer.getProgressMs() / 1000;
			scope.currentTimeFormatted = formatTime(scope.currentTime);

			scope.progressPercent = scope.currentTime * 100 / scope.duration;
			scope.progressDraggablePercent = scope.progressPercent < 1 ? 0 : scope.progressPercent - 1;

			self.progressBarElement.css({ width: scope.progressPercent + "%" });
			self.progressDraggableElement.css({ left: scope.progressDraggablePercent + "%" });
		}

		self.refreshVolume = function () {
			scope.volumePercent = audioPlayer.getVolumePercent();
			scope.volumeDraggablePercent = scope.volumePercent < 1 ? 0 : scope.volumePercent - 1;
			self.volumeBarElement.css({ width: scope.volumePercent + "%" });
			self.volumeDraggableElement.css({ left: scope.volumeDraggablePercent + "%" });
		}

		self.formatTime = function (value, format) {

			if (isNaN(value)) {
				value = 0;
			}

			format = format || "h:m:s";

			var hr = Math.floor(value / 3600);
			var min = Math.floor((value % 3600) / 60);
			var sec = Math.floor(value % 60);

			if (hr != 0 && min < 10) {
				min = "0" + min;
			}
			if (sec < 10) {
				sec = "0" + sec;
			}

			if (hr == 0) {
				format = "m:s";
			}

			var result = format.replace("h", "" + hr);
			result = result.replace("m", "" + min);
			result = result.replace("s", "" + sec);

			return result;
		}

		self.startProgressTimer = function () {
			if (angular.isDefined(self.updateTimer)) {
				return;
			}

			self.updateTimer = $interval(self.refreshCurrentTime, 10);
		}

		self.stopProgressTimer = function () {
			if (angular.isDefined(self.updateTimer)) {
				$interval.cancel(self.updateTimer);
				self.updateTimer = undefined;
			}
		}

		self.onMouseMove = function (event) {

			var offset = event.pageX - self.lastMouseX;
			self.lastMouseX = event.pageX;

			if (self.volumeDragged) {
				var volumePercent = audioPlayer.getVolumePercent();
				volumePercent += offset * 100 / self.volumeBackgroundElement[0].offsetWidth;
				audioPlayer.setVolumePercent(volumePercent);
				self.refreshVolume();
			}

			if (self.progressDragged) {
				var progressPercent = audioPlayer.getProgressPercent();
				progressPercent += offset * 100 / self.progressBackgroundElement[0].offsetWidth;
				audioPlayer.setProgressPercent(progressPercent);
				self.refreshCurrentTime();
			}
		}

		self.onMouseUp = function (event) {
			self.volumeDragged = false;
			self.progressDragged = false;

			$document.off('mousemove', self.onMouseMove);
			$document.off('mouseup', self.onMouseUp);
		}

		self.refreshCurrentTime();
		self.refreshVolume();
	}

	return {
		restrict: 'E',
		scope: {
			src: '@',
			type: '@',
			preload: '@'
		},
		templateUrl: '/Scripts/angular-audioplayer/angular-audioplayer.html',
		link: link
	}
}]);