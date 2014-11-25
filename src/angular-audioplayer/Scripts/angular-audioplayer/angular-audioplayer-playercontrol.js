function AudioPlayerControl($interval, $document, audioPlayerService) {

	function link(scope, element, attrs) {

		var self = this;
		self.updateTimer = undefined;
		self.lastMouseX = 0;

		self.progressBackgroundElement = angular.element(element[0].children[0].children[7].children[3]); 
		self.progressBarElement = angular.element(element[0].children[0].children[7].children[3].children[0]);
		self.progressDraggableElement = angular.element(element[0].children[0].children[7].children[0]);
		self.progressDragged = false;

		progressDraggableElement.on('mousedown', function (event) {
			event.preventDefault();
			self.progressDragged = true;
			self.lastMouseX = event.pageX;

			$document.on('mousemove', self.onProgressMouseMove);
			$document.on('mouseup', self.onProgressMouseUp);
		});

		audioPlayerService.setOnTrackChanged(function () {

			self.refreshCurrentTime();
		});

		audioPlayerService.setOnPlaying(function () { self.onPlaying(); });
		audioPlayerService.setOnPaused(function () { self.onPaused(); });

		element.bind('mouseenter', function () {
			scope.hideCurrentTime = false;
			scope.hideDuration = false;
		});

		scope.isPlaying = false;
		scope.isMuted = false;

		scope.hideCurrentTime = true;
		scope.hideDuration = true;

		scope.hideRewind = !(typeof attrs.hideRewind === "undefined");
		scope.hideFastForward = !(typeof attrs.hideFastForward === "undefined");
		scope.hideSkipPrevious = !(typeof attrs.hideSkipPrevious === "undefined");
		scope.hideStop = !(typeof attrs.hideStop === "undefined");
		scope.hideSkipNext = !(typeof attrs.hideSkipNext === "undefined");
		scope.hideVolume = !(typeof attrs.hideVolume === "undefined");
		scope.hideProgressBar = !(typeof attrs.hideProgressBar === "undefined");
		scope.hideDescription = !(typeof attrs.hideDescription === "undefined");

		scope.progressDraggablePercent = 0;
		scope.progressPercent = 0;
		scope.currentTime = 0;
		scope.duration = 0;

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
			audioPlayerService.skipPrevious();
		}

		scope.onSkipNextClick = function () {
			self.stop();
			audioPlayerService.skipNext();
		}

		scope.onRewindClick = function (val) {
			audioPlayerService.rewind(val * 1000);
		}

		scope.onFastForwardClick = function (val) {
			audioPlayerService.fastForward(val * 1000);
		}

		scope.onMuteClick = function () {
			scope.isMuted = !scope.isMuted;
			audioPlayerService.mute();
		}

		scope.onProgressBarClick = function (event) {
			var seekPercentage = (event.offsetX / event.currentTarget.offsetWidth) * 100;
			if (seekPercentage > 100) {
				seekPercentage = 100;
			}

			audioPlayerService.setProgressPercent(seekPercentage);

			self.play();
		}

		scope.$watch('src', function (newValue, oldValue) {
			if (newValue) {
				audioPlayerService.setPlaylist([{ src: newValue, type: scope.type }]);
			}

			self.refreshCurrentTime();
		});

		scope.$watch('preload', function (newValue, oldValue) {
			if (newValue) {
				audioPlayerService.setPreload(newValue);
			}
		});

		scope.$watch('type', function (newValue, oldValue) {
			if (newValue) {
				audioPlayerService.setPlaylist([{ src: scope.src, type: newValue }]);
			}
		});

		scope.$on('$destroy', function () {
			//self.stop();
		});

		self.onPlaying = function () {
			scope.isPlaying = true;
			startProgressTimer();
		}

		self.onPaused = function () {
			scope.isPlaying = false;
			stopProgressTimer();
			refreshCurrentTime();
		}

		self.play = function () {
			audioPlayerService.play();
		}

		self.pause = function () {
			audioPlayerService.pause();
		}

		self.stop = function () {
			audioPlayerService.stop();
		}

		self.refreshCurrentTime = function () {
			scope.duration = audioPlayerService.getDurationMs() / 1000;
			scope.durationFormatted = formatTime(scope.duration);

			scope.currentTime = audioPlayerService.getProgressMs() / 1000;
			scope.currentTimeFormatted = formatTime(scope.currentTime);

			scope.progressPercent = scope.currentTime * 100 / scope.duration;
			scope.progressDraggablePercent = scope.progressPercent < 1 ? 0 : scope.progressPercent - 1;

			self.progressBarElement.css({ width: scope.progressPercent + "%" });
			self.progressDraggableElement.css({ left: scope.progressDraggablePercent + "%" });
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

		self.onProgressMouseMove = function (event) {

			var offset = event.pageX - self.lastMouseX;
			self.lastMouseX = event.pageX;

			if (self.progressDragged) {
				var progressPercent = audioPlayerService.getProgressPercent();
				progressPercent += offset * 100 / self.progressBackgroundElement[0].offsetWidth;
				audioPlayerService.setProgressPercent(progressPercent);
				self.refreshCurrentTime();
			}
		}

		self.onProgressMouseUp = function (event) {
			self.progressDragged = false;

			$document.off('mousemove', self.onProgressMouseMove);
			$document.off('mouseup', self.onProgressMouseUp);
		}

		self.refreshCurrentTime();
	}

	return {
		restrict: 'E',
		scope: {
			src: '@',
			type: '@',
			preload: '@'
		},
		templateUrl: '/Scripts/angular-audioplayer/angular-audioplayer-playercontrol.html',
		link: link
	}
	
};