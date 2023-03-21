//general functions that changes the display
const noticeDiv = document.getElementById("notice");

function notice(content, imageURI = null) {
    noticeDiv.innerHTML = content;

    if (imageURI) {
        var image = new Image();
        image.src = "resource/" + imageURI;
        noticeDiv.append(image);
    }
    noticeDiv.style.display = "block";
}

function noticeDown() {
    noticeDiv.innerHTML = "";
    noticeDiv.style.display = "none";
}

//general function that plays an audio file

canPlayBGM = false;

function playAudio(fileName, volume = 1, loop = false) {
    if (canPlayBGM) {
        var pathToAudio = "resource/music/" + fileName;
        var audio = new Audio(pathToAudio);

        audio.volume = volume;
        audio.loop = loop;

        audio.play();

        return audio;
    }
}