//handle start again (when hitting enter becomes start)
//weighted tiles
//timer
var tiles = Array.from(document.getElementsByClassName("tile"));
var played = Array.from(document.getElementsByClassName("played"));
var score = document.getElementById("score");
var error = document.getElementById("error");
var timer = document.getElementById("timer");

var vowels = [65,69,73,79,85]
var consonants = [66,67,68,70,71,72,74,75,76,77,78,80,81,82,83,84,86,87,88,89,90];
var originalRack;
var rack = [];
var word = [];
var dict = [];
$(function(){
        $.get('./WWF.txt', function(data){
            async: false;
            dict = data.split('\n');
        });
    });

var original = 5; //change original value here
var secDuration = original;	// How long the timer is set, in seconds
var running = false;		// A boolean
var timerInterval = secDuration;
var clickStart = 0;
var timesUp = false;

function start(e) {
    //vowelsNum is randomized between 2 and 3
    var vowelsNum = Math.floor(Math.random() * 2) + 2;
    var consonantsNum = 7 - vowelsNum
    for (var i = 0 ; i < vowelsNum ; i++) {
        rack.push(vowels[Math.floor(Math.random() * vowels.length)]);
    }
    for (var i = 0 ; i < consonantsNum ; i++) {
        rack.push(consonants[Math.floor(Math.random() * consonants.length)]);
    }
    rack.forEach(function(tile,index) {
      tiles[index].innerHTML = String.fromCharCode(tile);  
    })
    originalRack = rack.slice();
    
    //timer
    if (clickStart == 0) {
        clickStart++;
    }
    else {
        return;
    }
    timerInterval = setInterval(function() {
        if (secDuration == 0) {
            timesUp = true;
            error.innerHTML = "Time's up!"
        } else {
            render(timer, (secDuration--) - 1);
        }
    }, 1000);
    e.stopImmediatePropagation();
}

function play(e) {
    if (timesUp) {
        return;
    }
    var key = e.keyCode
    if (key == 13) {
        played.forEach(function(each) {
            each.innerHTML = "";
        });
        var wordPlayed = word.join("");
        if (dict.includes(wordPlayed)) {
            var earned = Number(score.innerHTML) + 10
            score.innerHTML = earned
        }
        else {
            error.innerHTML = "NOPE!"
        }
        word = [];
        rack = originalRack.slice();
    }
    if(word.length > 6) {
        return;
    }
    else {
        if (rack.includes(key)) {
            var l = word.length;
            var letter = String.fromCharCode(key);
            played[l].innerHTML = letter;
            word.push(letter);
            rack.splice(rack.indexOf(key),1);
        }
    }
    
}

/*
	getTimeString takes in a number of seconds and return
	a time string in the format "mm:ss"
	(2 digits for minutes, 2 digits for seconds)

	Example: 	getTimeString(10) => "00:10"
*/
function getTimeString(totalSeconds) {
	var ms = totalSeconds/60;
    var s = Math.floor(totalSeconds%60);
    var m = Math.floor(ms%60);
    var second = s%10==s ? "0" + s : s;
    var minute = m%10==m ? "0" + m : m;
    return minute + ":" + second;
}

/*
	render(displayDiv, totalSeconds) displays the totalSeconds
	in "mm:ss" format in the browser where displayDiv is
*/
function render(displayDiv, totalSeconds) {
	timer.innerHTML = getTimeString(totalSeconds);
}

render(timer, secDuration);
document.getElementById("start").addEventListener("click", start);
window.addEventListener('keydown', play);
