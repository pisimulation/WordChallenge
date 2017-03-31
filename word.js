//weighted tiles?
//understand Math.random
//number of letter tiles are different; only 1 x
//randomized success msg
var tiles = Array.from(document.getElementsByClassName("tile"));
var played = Array.from(document.getElementsByClassName("played"));
var score = document.getElementById("score");
var error = document.getElementById("error");
var timer = document.getElementById("timer");
var startBtn = document.getElementById("start");
var tickAudio = document.querySelector("audio[data-audio=\"tick\"]");
var endAudio = document.querySelector("audio[data-audio=\"end\"]");
var correctAudio = document.querySelector("audio[data-audio=\"correct\"]");
var incorrectAudio = document.querySelector("audio[data-audio=\"incorrect\"]");
var repeatAudio = document.querySelector("audio[data-audio=\"repeat\"]");
var extraAudio = document.querySelector("audio[data-audio=\"extra\"]");

var vowels = [65,69,73,79,85]
var vowelsScore = [1,1,1,1,1]
var consonants = [66,67,68,70,71,72,74,75,76,77,78,80,81,82,83,84,86,87,88,89,90];
var consonantsScore = [3,3,2,4,2,4,8,5,1,4,1,3,10,1,1,1,4,4,8,4,10]
var points = {}
vowels.forEach(function(tile,index) {
    points[tile] = vowelsScore[index];
})
consonants.forEach(function(tile,index) {
    points[tile] = consonantsScore[index];
})
var originalRack;
var rack = [];
var word = [];
var dict = [];
var wordTaken = [];
var toBonus = 0;

var xhttp = new XMLHttpRequest();
xhttp.open("GET", "WWF.txt", false);
xhttp.send();
dict = xhttp.responseText.split('\n')

var original = 45; //change original value here
var bonus = 3; //change bonus value here
var secDuration = original;	// How long the timer is set, in seconds
var running = false;		// A boolean
var timerInterval = secDuration;
var clickStart = 0;
var timesUp = false;
var pause = false;

function start(e) {
    if (timesUp) {
        secDuration = original;
        timesUp = false;
        score.innerHTML = 0;
        wordTaken = [];
    }
    startBtn.style.visibility = 'hidden';
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
      tiles[index].src = "scrabble_2d/small/letter_" + String.fromCharCode(tile).toLowerCase() + ".png";  
    })
    originalRack = rack.slice();
    
    //timer
    if (clickStart == 0) {
        clickStart++;
    }
    else {
        return;
    }
    var ended = false;
    timerInterval = setInterval(function() {
        if (secDuration == 0) {
            timesUp = true;
            error.innerHTML = "Time's up!"
            startBtn.style.visibility = 'visible';
            rack=[];
            word=[];
            played.forEach(function(tile, index) {
                played[index].src = "";
            })
            if (!ended) {
                endAudio.play();    
                ended = true;
            }
            
        } else {
            render(timer, (secDuration--) - 1);
            if (secDuration < 11) {
                tickAudio.play();
            }
        }
    }, 1000);
    e.stopImmediatePropagation();
}

function play(e) {
    if (timesUp || pause) {
        return;
    }
    var key = e.keyCode
    /*
    //PAUSE UNIMPLEMENTED
    if (key == 32) {
        clickStart = 0;
        clearInterval(timerInterval);
        pause = true;
        return;
    }
    */
    if (key == 13) {
        tiles.forEach(function(tile) {
            tile.classList.remove("down");
        })
        played.forEach(function(each) {
            each.src = "";
        });
        var wordPlayed = word.join("");
        if (dict.includes(wordPlayed)) {
            if (wordTaken.includes(wordPlayed)) {
                error.innerHTML = "NO REPEAT!"
                repeatAudio.play();
            }
            else {
                var scored = 0;
                word.forEach(function(letter) {
                    scored += points[letter.charCodeAt(0)]
                })
                console.log("You score " + scored);
                var earned = Number(score.innerHTML) + scored
                score.innerHTML = earned;
                error.innerHTML = "AWESOME!";
                wordTaken.push(wordPlayed)
                correctAudio.play();
                toBonus += 1;
            }
        }
        else {
            error.innerHTML = "NOPE!"
            incorrectAudio.play()
            toBonus = 0;
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
            played[l].src = "scrabble_2d/small/letter_" + letter.toLowerCase() + ".png";;
            tiles[l].classList.toggle("down")
            word.push(letter);
            rack.splice(rack.indexOf(key),1);
        }
        else {
            //wrong key
        }
    }
    
    //extra time
    if (toBonus == 3) {
        secDuration += bonus;
        toBonus = 0
        extraAudio.play();
        error.innerHTML = "+5 seconds!"
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

