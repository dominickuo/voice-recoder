'use strict';

window.addEventListener('load', function() {
  var status = 'STOPPED';
  var list;
  var recordButton;
  var stopButton;
  var overlay;
  var mediaRecorder = null;
  var chunks = [];
  var blobs = [];
  var index = 0;

  function setup() {
    navigator.getUserMedia = (navigator.getUserMedia || navigator.mozGetUserMedia);

    list = document.getElementById('list');
    recordButton = document.getElementById('startpause');
    stopButton = document.getElementById('stop');
    overlay = document.getElementById('overlay');

    recordButton.addEventListener('click', record);
    stopButton.addEventListener('click', stop);

    changeStatus('STOPPED');
  }

  function changeStatus(option) {
    status = option;
    overlay.hidden = (status === 'STOPPED');

    var message = document.getElementById('message');
    message.textContent = status;
  }

  function record() {
    switch(status) {
      case 'STOPPED':
        var constraints = { audio: true };
        navigator.getUserMedia(constraints, getAudioStream, errorCallBack);
        break;
      case 'RECORDING':
        mediaRecorder.pause();
        changeStatus('PAUSED');
        break;
      case 'PAUSED':
        mediaRecorder.resume();
        changeStatus('RECORDING');
        break;
    }
  }

  function stop() {
    if (mediaRecorder) {
      mediaRecorder.stop();

      mediaRecorder.onstop = function(event) {
        // Make blob out of our blobs, and open it.
        var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        parseRecorded(blob, addToList);

        mediaRecorder = null;
        chunks = [];
      };

      changeStatus('STOPPED');
    }
  }

  function getAudioStream(stream) {
    if (!mediaRecorder) {
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.start();
    } else {
      mediaRecorder.resume();
    }

    mediaRecorder.ondataavailable = function(event) {
      // push each chunk (blobs) in an array
      chunks.push(event.data);
    };

    changeStatus('RECORDING');
  }

  function errorCallBack(e) {
    alert('Cannot get the audio stream!');
  }

  function addToList(metadata) {
    var seconds = formatTime(metadata.duration);
    var li = document.createElement('li');
    li.dataset.index = index;
    li.addEventListener('click', previewRecorded);

    var span = document.createElement('span');
    span.textContent = 'Audio ' + (index + 1) + ' - ' + seconds;
    var audio = document.createElement('audio');
    audio.controls = true;

    li.appendChild(span);
    li.appendChild(audio);

    list.appendChild(li);
    index++;
  }

  function parseRecorded(blob, callback) {
    var parser = new Audio();
    parser.src = URL.createObjectURL(blob);

    parser.onloadedmetadata = function(event) {
      var metadata = { duration: parser.duration };
      blobs.push(blob);
      callback(metadata);
    }
  }

  function previewRecorded(event) {
    var item = event.target;
    var player = item.children[1];
    var index = event.target.dataset.index;

    if (index) {
      resetPreviewing();
      item.classList.add('previewing');

      player.src = URL.createObjectURL(blobs[index]);
      player.preload = 'metadata';
    }
  }

  function resetPreviewing() {
    Array.prototype.forEach.call(list.children, function(child) {
      child.classList.remove('previewing');
    });
  }

  setup();
});
