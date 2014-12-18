function AudioPlayerService() {

	var self = this;

	self.shuffle = false;
	self.repeat = false;

	self.defaultStepSeconds = 10;
	self.isPlaying = false;
	self.player = new Audio();
	self.player.controls = false;
	setPreload("metadata");

	self.playlist = null;
	self.currentPlaylistIndex = 0;
	self.pendingSeekSeconds = -1;

	self.onReadyListeners = [];
	self.onTrackChangedListeners = [];
	self.onTrackEndedListeners = [];
	self.onVolumeChangedListeners = [];
	self.onPlayingListeners = [];
	self.onPausedListeners = [];
	self.onProgressChangedListeners = [];

	self.player.addEventListener('canplay', function () { onReady(); });
	self.player.addEventListener('loadeddata', function () { onTrackChanged(); });
	self.player.addEventListener('ended', function () { onTrackEnded(); });
	self.player.addEventListener('volumechange', function () { onVolumeChanged(); });
	self.player.addEventListener('play', function () { onPlaying(); });
	self.player.addEventListener('pause', function () { onPaused(); });
	self.player.addEventListener('timeupdate', function () { onProgress(); });

	self.loadPlayerSource = function () {
		if (self.playlist && self.playlist[self.currentPlaylistIndex]) {
			self.loading = true;
			self.player.type = self.playlist[self.currentPlaylistIndex].type;
			self.player.src = self.playlist[self.currentPlaylistIndex].src;
		} else {
			self.loading = false;
			self.player.type = null;
			self.player.src = null;
		}
	}

	return ({
		setPlaylist: setPlaylist,
		getPlaylist: getPlaylist,
		play: play,
		pause: pause,
		stop: stop,
		skipNext: skipNext,
		skipPrevious: skipPrevious,
		setPlaylistIndex: setPlaylistIndex,
		getPlaylistIndex: getPlaylistIndex,

		setDefaultStepSeconds: setDefaultStepSeconds,
		fastForward: fastForward,
		rewind: rewind,

		mute: mute,
		setVolumePercent: setVolumePercent,
		getVolumePercent: getVolumePercent,

		setPreload: setPreload,
		setProgressSeconds: setProgressSeconds,
		getProgressSeconds: getProgressSeconds,
		setProgressPercent: setProgressPercent,
		getProgressPercent: getProgressPercent,
		getDurationSeconds: getDurationSeconds,
		getIsPlaying: getIsPlaying,
		getIsMuted: getIsMuted,

		//EVENT LISTENER SETTERS
		setOnReady: setOnReady,
		setOnTrackChanged: setOnTrackChanged,
		setOnTrackEnded: setOnTrackEnded,
		setOnVolumeChanged: setOnVolumeChanged,
		setOnPlaying: setOnPlaying,
		setOnPaused: setOnPaused,
		setOnProgressChanged: setOnProgressChanged
	});

	function setPreload(preload) {
		self.player.preload = preload;
	}

	function setDefaultStepSeconds(defaultStepSeconds) {
		self.defaultStepSeconds = defaultStepSeconds;
	}

	function setPlaylist(playlist) {
		self.playlist = playlist;
		self.currentPlaylistIndex = 0;

		self.loadPlayerSource();
	}

	function getPlaylist() {
		return self.playlist;
	}

	function setPlaylistIndex(idx) {
		self.currentPlaylistIndex = idx;

		self.loadPlayerSource();
	}

	function getPlaylistIndex() {
		return self.currentPlaylistIndex;
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
		onPaused();
	}

	function skipNext() {

		if (!self.playlist) {
			return;
		}

		pause();

		var idx = self.currentPlaylistIndex + 1;

		if (idx >= self.playlist.length) {

			if (self.repeat) {
				idx = 0;
			} else {
				return;
			}
		}

		setPlaylistIndex(idx);

		play();
	}

	function skipPrevious() {
		if (!self.playlist) {
			return;
		}

		pause();

		var idx = self.currentPlaylistIndex - 1;

		if (idx < 0) {
			if (self.repeat) {
				idx = self.playlist.length - 1;
			} else {
				return;
			}
		}

		setPlaylistIndex(idx);

		play();
	}

	function fastForward(stepSeconds) {
		var step = stepSeconds || self.defaultStepSeconds;

		if (self.player.readyState == 0) {
			return;
		}

		self.player.currentTime += step;
	}

	function rewind(stepSeconds) {
		var step = stepSeconds || self.defaultStepSeconds;

		if (self.player.readyState == 0) {
			return;
		}

		self.player.currentTime -= step;
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

	function setProgressSeconds(progressSeconds) {

		if (self.player.readyState == 0) {
			return;
		}

		if (self.loading) {
			self.pendingSeekSeconds = progressSeconds;
		} else {
			self.player.currentTime = progressSeconds;
		}
	}

	function getProgressSeconds() {
		return self.player.currentTime;
	}

	function setProgressPercent(progressPercent) {

		if (isNaN(self.player.duration)) {
			setProgressSeconds(0);
			return;
		}

		var progressSeconds = self.player.duration * progressPercent / 100;
		setProgressSeconds(progressSeconds);
	}

	function getProgressPercent() {
		return self.player.currentTime * 100 / self.player.duration;
	}

	function getDurationSeconds() {
		return self.player.duration;
	}

	function getIsPlaying() {
		return self.isPlaying;
	}

	function getIsMuted() {
		return player.muted;
	}

	function onReady() {
		for (var i = 0; i < self.onReadyListeners.length; i++) {
			self.onReadyListeners[i]();
		}

		self.loading = false;

		if (self.pendingSeekSeconds >= 0) {
			setProgressSeconds(pendingSeekSeconds);
		}
	}

	function onTrackChanged() {
		for (var i = 0; i < self.onTrackChangedListeners.length; i++) {
			self.onTrackChangedListeners[i]();
		}
	}


	function onTrackEnded() {
		for (var i = 0; i < self.onTrackEndedListeners.length; i++) {
			self.onTrackEndedListeners[i]();
		}

		skipNext();
	}


	function onVolumeChanged() {
		for (var i = 0; i < self.onVolumeChangedListeners.length; i++) {
			self.onVolumeChangedListeners[i]();
		}
	}


	function onPlaying() {
		for (var i = 0; i < self.onPlayingListeners.length; i++) {
			self.onPlayingListeners[i]();
		}

		self.isPlaying = true;
	}


	function onPaused() {
		for (var i = 0; i < self.onPausedListeners.length; i++) {
			self.onPausedListeners[i]();
		}

		self.isPlaying = false;
	}

	function onProgress() {
		for (var i = 0; i < self.onProgressChangedListeners.length; i++) {
			self.onProgressChangedListeners[i]();
		}
	}

	function setOnReady(onReadyListener) {
		if (onReadyListener) {
			self.onReadyListeners.push(onReadyListener);
		}
	}

	function setOnTrackChanged(onTrackChangedListener) {
		if (onTrackChangedListener) {
			self.onTrackChangedListeners.push(onTrackChangedListener);
		}
	}

	function setOnTrackEnded(onTrackEndedListener) {
		if (onTrackEndedListener) {
			self.onTrackEndedListeners.push(onTrackEndedListener);
		}
	}

	function setOnVolumeChanged(onVolumeChangedListener) {
		if (onVolumeChangedListener) {
			self.onVolumeChangedListeners.push(onVolumeChangedListener);
		}
	}

	function setOnPlaying(onPlayingChangedListener) {
		if (onPlayingChangedListener) {
			self.onPlayingListeners.push(onPlayingChangedListener);
		}
	}

	function setOnPaused(onPausedChangedListener) {
		if (onPausedChangedListener) {
			self.onPausedListeners.push(onPausedChangedListener);
		}
	}

	function setOnProgressChanged(onProgressChangedListener) {
		if (onProgressChangedListener) {
			self.onProgressChangedListeners.push(onProgressChangedListener);
		}
	}
};