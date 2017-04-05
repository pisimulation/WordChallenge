/*
Possible extra features:
- weighted tiles? understand Math.random
- randomized success msg
- Joomy said "at the end, you can list what words the user got right, what words the user got wrong, and what else they could write. i would love to see what words i missed."
*/
var tiles = Array.from(document.getElementsByClassName("tile"));
var played = Array.from(document.getElementsByClassName("played"));
var score = document.getElementById("score");
var error = document.getElementById("error");
var timer = document.getElementById("timer");
var youGot = document.getElementById("youGot");
var youMissed = document.getElementById("youMissed");
var answer = document.getElementById("answer");
var startBtn = document.getElementById("start");
var tickAudio = document.querySelector("audio[data-audio=\"tick\"]");
var endAudio = document.querySelector("audio[data-audio=\"end\"]");
var correctAudio = document.querySelector("audio[data-audio=\"correct\"]");
var incorrectAudio = document.querySelector("audio[data-audio=\"incorrect\"]");
var repeatAudio = document.querySelector("audio[data-audio=\"repeat\"]");
var extraAudio = document.querySelector("audio[data-audio=\"extra\"]");

// map a tile to its freq
function map(letters, freqs) {
    var newLetters = []
    letters.forEach(function(letter, index) {
        for (var i = 0; i < freqs[index]; i++) {
            newLetters.push(letter);
        }
    })
    return newLetters
}
var vowelsTile = [65,69,73,79,85]
var vowelsFreq = [9,12,9,8,4]
var vowelsScore = [1,1,1,1,1]
var vowels = map(vowelsTile,vowelsFreq)
var consonantsTile = [66,67,68,70,71,72,74,75,76,77,78,80,81,82,83,84,86,87,88,89,90];
var consonantsFreq = [2,2,4,2,3,2,1,1,4,2,6,2,1,6,4,6,2,2,1,2,1];
var consonantsScore = [3,3,2,4,2,4,8,5,1,4,1,3,10,1,1,1,4,4,8,4,10];
var consonants = map(consonantsTile, consonantsFreq)
var points = {}
vowelsTile.forEach(function(tile,index) {
    points[tile] = vowelsScore[index];
})
consonantsTile.forEach(function(tile,index) {
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

var original = 50; //change original value here
var bonus = 5; //change bonus value here
var secDuration = original;	// How long the timer is set, in seconds
var running = false;		// A boolean
var timerInterval = secDuration;
var clickStart = 0;
var timesUp = false;
var pause = false;
var soundPlayed = false;
//anagram solver
var missed = []
answer.style.visibility = 'hidden'
function start(e) {
    soundPlayed = false;
    if (timesUp) {
        secDuration = original;
        timesUp = false;
        score.innerHTML = 0;
        wordTaken = [];
    }
    answer.style.visibility = 'hidden'
    youGot.innerHTML = "";
    youMissed.innerHTML = "";
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
    
    timerInterval = setInterval(function() {
        var ended = false;
        if (secDuration == 0) {
            timesUp = true;
            error.innerHTML = "Time's up!"
            startBtn.style.visibility = 'visible';
            rack=[];
            word=[];
            played.forEach(function(tile, index) {
                played[index].src = "";
            })
            
            if (!soundPlayed) {
                endAudio.play();
                soundPlayed = true;
                localStorage.setItem('currentHighScore',JSON.stringify(Number(score.innerHTML)))
                highScore.innerHTML = localStorage.getItem('currentHighScore');
            }
            if (!ended) {
                ended = true;
                report(wordTaken);
                youGot.innerHTML = wordTaken;
                youMissed.innerHTML = missed;
                answer.style.visibility = 'visible'
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
    
    //delete
    if (key == 8) {
        var deleted = word[word.length - 1].charCodeAt(0);
        word.pop();
        played[word.length].src = "";
        var i = originalRack.indexOf(deleted)
        tiles[i].classList.remove("down")
        rack.push(deleted)
    }
        
    if(word.length > 6) {
        return;
    }
    else {
        if (rack.includes(key)) {
            var l = word.length;
            var letter = String.fromCharCode(key);
            played[l].src = "scrabble_2d/small/letter_" + letter.toLowerCase() + ".png";;
            var i = originalRack.indexOf(key)
            tiles[i].classList.toggle("down")
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
        error.innerHTML = "+" + bonus + " seconds!"
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

/*
    ANAGRAM SOLVER
*/

/*
    For each word in the dict, sort the letters and map the sorted combination (key) to a singleton of original word (value)
    When a word has the same sorted combination, append each original word into the list
*/

function makeAllWords(dict) {
    var allWords = {}
    dict.forEach(function(word) {
        var sortedWord = word.split("").sort().join("").toLowerCase();
        var old = allWords[sortedWord]
        if (old) {
            old.push(word.toLowerCase())
            allWords[sortedWord] = old;
        }
        else {
            allWords[sortedWord] = [word.toLowerCase()];
        }
    })
    return allWords;
}

var allWords = makeAllWords(dict)

//union arrays, no duplicates in result
function union_arrays (x, y) {
  var obj = {};
  for (var i = x.length-1; i >= 0; -- i)
     obj[x[i]] = x[i];
  for (var i = y.length-1; i >= 0; -- i)
     obj[y[i]] = y[i];
  var res = []
  for (var k in obj) {
    if (obj.hasOwnProperty(k))  // <-- optional
      res.push(obj[k]);
  }
  return res;
}

//find all permutations of letters
function permute(leafs) {
    var branches = [];      
    if( leafs.length == 1 ) return leafs;       
    for( var k in leafs ) {
        var leaf = leafs[k];
        permute(leafs.join('').replace(leaf,'').split('')).concat("").map(function(subtree) {
            branches.push([leaf].concat(subtree));
        });
    }
    return branches.map(function(str){return str.join('')});
};

/*
    Given 7 letters, find permutations, find anagrams for each sorted permutation
*/
function makeAnagram(letters) {
    var allSS = permute(letters.split(''))
    var allsortedSS = []
    allSS.forEach(function(each) {
        allsortedSS.push(each.split("").sort().join(""));
    })
    var anagrams = []
    allsortedSS.forEach(function(each) {
        if (allWords[each] != undefined) {
            var wordsEach = allWords[each]
            anagrams = union_arrays(anagrams,wordsEach);
        } 
    })
    return anagrams;
}

/*
    Given a list of taken words, find word you missed
*/
function report(wordTaken) {
    var rack = originalRack
    var has = []
    rack.forEach(function(key) {
        has.push(String.fromCharCode(key))
    })
    has = has.join("");
    var anagrams = makeAnagram(has.toLowerCase());
    wordTaken.forEach(function(word) {
        word = word.toLowerCase();
        if (anagrams.includes(word)) {
            anagrams.splice(anagrams.indexOf(word),1);
        }
    })
    missed = anagrams;
}

/*
    LOCAL STORAGE FOR HIGH SCORE
*/

var highScore = document.getElementById("highScore")

var currentHighScore = JSON.parse(localStorage.getItem('currentHighScore')) || 0;

highScore.innerHTML = currentHighScore;


