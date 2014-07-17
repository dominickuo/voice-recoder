'use strict';

window.addEventListener('load', function() {
  var isRecording = false;
  var list;
  var recordButton;
  var stopButton;
  var mediaRecorder;
  var chunks = [];
  var blobs = [];
  var index = 0;

  function init() {
    navigator.getUserMedia = (navigator.getUserMedia || navigator.mozGetUserMedia);
  }

  function setup() {
    list = document.getElementById('list');
    recordButton = document.getElementById('startpause');
    stopButton = document.getElementById('stop');

    recordButton.addEventListener('click', function(event) {
      var constraints = { audio: true };

      if (!isRecording) {
        navigator.getUserMedia(constraints, getAudioStream, errorCallBack);
      } else {
        // Pause the recording.
        alert('pause');
        mediaRecorder.pause();
      }
    });

    stopButton.addEventListener('click', function(event) {
      alert('stop');
      mediaRecorder.stop();

      mediaRecorder.onstop = function(event) {
       // Make blob out of our blobs, and open it.
       var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
       parseRecorded(blob, addToList);
       chunks = [];
     };
    });
  }

  function getAudioStream(stream) {
    mediaRecorder = new MediaRecorder(stream);

    alert('start');
    mediaRecorder.start();

    mediaRecorder.ondataavailable = function(event) {
      // push each chunk (blobs) in an array
      chunks.push(event.data);
    };
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

    resetPreviewing();
    item.classList.add('previewing');

    player.src = URL.createObjectURL(blobs[index]);
  }

  function resetPreviewing() {
    Array.prototype.forEach.call(list.children, function(child) {
      child.classList.remove('previewing');
    });
  }

  init();
  setup();
});
