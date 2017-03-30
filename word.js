//handle start again (when hitting enter becomes start)
//weighted tiles
var tiles = Array.from(document.getElementsByClassName("tile"));
var played = Array.from(document.getElementsByClassName("played"));
var score = document.getElementById("score");
var error = document.getElementById("error");
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
}

function play(e) {
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

document.getElementById("start").addEventListener("click", start);
window.addEventListener('keydown', play);
