const { PerformanceObserver, performance } = require('perf_hooks');
let { diff, concatEditGraph, printAverageTime, shortestEditSequence } = require('../lib/diff.js');
let { diffLinear, middleSnake } = require('../lib/diff2.js');
let fs = require('fs');
let process = require('process');

import test from 'ava';


function reverseString(str) {
  return str.split("").reverse().join("");
}

String.prototype.shuffle = function (thing){
  var currentIndex = this.length, temporaryValue, randomIndex;
  var array = this.split("");
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array.join("");
}
// stolen from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {

}
// TESTING DIFF1 AND DIFF 2

/////////////////////////////////////////////////////
// SMALL STRINGS
// To ensure fundamentals
/////////////////////////////////////////////////////
test('SES and MS can handle empty string', t => {
  let [lengthGreedy, _, _1] = shortestEditSequence("", "");
  let [lengthLinear, _2, _3] = middleSnake("", "");
  t.is(lengthGreedy, lengthLinear);
});

test('SES and MS produce the same output when looking at the diff of the string "a"', t => {
  let string1 = "a";
  let string2 = "a";
  let [lengthGreedy, _, _1] = shortestEditSequence(string1, string2);
  let [lengthLinear, _2, _3] = middleSnake(string1, string2);
  t.is(lengthGreedy, lengthLinear);
});

test('SES and MS produce the same output when looking at the two different one character strings', t => {
  let string1 = "a";
  let string2 = "b";
  let [lengthGreedy, _, _1] = shortestEditSequence(string1, string2);
  let [lengthLinear, _2, _3] = middleSnake(string1, string2);
  t.is(lengthGreedy, lengthLinear);
});

test('SES and MS produce the same output when looking at strings with a length difference of one', t => {
  let string1 = "a";
  let string2 = "ab";
  let [lengthGreedy, _, _1] = shortestEditSequence(string1, string2);
  let [lengthLinear, _2, _3] = middleSnake(string1, string2);
  t.is(lengthGreedy, lengthLinear);

  // Make sure order doesn't matter
  [lengthGreedy, _, _1] = shortestEditSequence(string2, string1);
  [lengthLinear, _2, _3] = middleSnake(string2, string1);
  t.is(lengthGreedy, lengthLinear);
});

test('SES and MS produce the same output when looking at strings with a length difference of two', t => {
  let string1 = "abc".shuffle();
  let string2 = "abdef".shuffle();
  let [lengthGreedy, _, _1] = shortestEditSequence(string1, string2);
  let [lengthLinear, _2, _3] = middleSnake(string1, string2);
  t.is(lengthGreedy, lengthLinear);

  // Make sure order doesn't matter
  [lengthGreedy, _, _1] = shortestEditSequence(string2, string1);
  [lengthLinear, _2, _3] = middleSnake(string2, string1);
  t.is(lengthGreedy, lengthLinear);
});

test('SES and MS produce the same output when looking at strings with a length difference of three', t => {
  let string1 = "abc".shuffle();
  let string2 = "abdefg".shuffle();

  let [lengthGreedy, _, _1] = shortestEditSequence(string1, string2);
  let [lengthLinear, _2, _3] = middleSnake(string1, string2);
  t.is(lengthGreedy, lengthLinear);

  // Make sure order doesn't matter
  [lengthGreedy, _, _1] = shortestEditSequence(string2, string1);
  [lengthLinear, _2, _3] = middleSnake(string2, string1);
  t.is(lengthGreedy, lengthLinear);
});

test('SES and MS produce the same output when looking at strings with a length difference of four', t => {
  let string1 = "abc".shuffle();
  let string2 = "abdefah".shuffle();

  let [lengthGreedy, _, _1] = shortestEditSequence(string1, string2);
  let [lengthLinear, _2, _3] = middleSnake(string1, string2);
  t.is(lengthGreedy, lengthLinear);

  // Make sure order doesn't matter
  [lengthGreedy, _, _1] = shortestEditSequence(string2, string1);
  [lengthLinear, _2, _3] = middleSnake(string2, string1);
  t.is(lengthGreedy, lengthLinear);
});


/////////////////////////////////////////////////////
// LARGE STRINGS
// To ensure operating on larger scales
/////////////////////////////////////////////////////

test('diff1 and diffLinear find a diff 0 for really long strings', t => {
  let stringOne = "I am the very model of a modern Major-General, I've information vegetable, animal, and mineral, I know the kings of England, and I quote the fights historical From Marathon to Waterloo, in order categorical I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical, About binomial theorem I'm teeming with a lot o' news, (bothered for a rhyme) With many cheerful facts about the square of the hypotenuse. I'm very good at integral and differential calculus; I know the scientific names of beings animalculous: In short, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General. I know our mythic history, King Arthur's and Sir Caradoc's; I answer hard acrostics, I've a pretty taste for paradox, I quote in elegiacs all the crimes of Heliogabalus, In conics I can floor peculiarities parabolous; I can tell undoubted Raphaels from Gerard Dows and Zoffanies, I know the croaking chorus from The Frogs of Aristophanes! Then I can hum a fugue of which I've heard the music's din afore, (bothered for a rhyme) And whistle all the airs from that infernal nonsense Pinafore  Then I can write a washing bill in Babylonic cuneiform, And tell you ev'ry detail of Caractacus's uniform: In short, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General  In fact, when I know what is meant by 'mamelon' and 'ravelin', When I can tell at sight a Mauser rifle from a javelin, When such affairs as sorties and surprises I'm more wary at, And when I know precisely what is meant by 'commissariat', When I have learnt what progress has been made in modern gunnery, When I know more of tactics than a novice in a nunnery – In short, when I've a smattering of elemental strategy – (bothered for a rhyme) You'll say a better Major-General has never sat a gee  For my military knowledge, though I'm plucky and adventury, Has only been brought down to the beginning of the century; But still, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General.";
  let stringTwo = "I am the very model of a modern Major-General,  vegetable, animal, and mineral, I know , and I quote the fights historical From Marathon to Waterloo, in order categorical I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical, About binomial theorem I'm teeming with a lot o' news, (bothered for a rhyme) With many cheerful facts about the square of the hypotenuse. I'm very good at integral and differential calculus; I know the scientific names of beings animalculous: In short, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General. I know our mythic history, King Arthur's and Sir Caradoc's; I answer hard acrostics, I've a pretty taste for paradox, I quote in elegiacs all the crimes of Heliogabalus, In conics I can floor peculiarities parabolous; I can tell undoubted Raphaels from Gerard Dows and Zoffanies, I know the croaking chorus from The Frogs of Aristophanes! Then I can hum a fugue of which I've heard the music's din afore, (bothered for a rhyme) And whistle all the airs from that infernal nonsense Pinafore  Then I can write a washing bill in Babylonic cuneiform, And tell you ev'ry detail of Caractacus's uniform: In short, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General  In fact, when I know what is meant by 'mamelon' and 'ravelin', When I can tell at sight a Mauser rifle from a javelin, When such affairs as sorties and surprises I'm more wary at, And when I know precisely what is meant by 'commissariat', When I have learnt what progress has been made in modern gunnery, When I know more of tactics than a novice in a nunnery – In short, when I've a smattering of elemental strategy – (bothered for a rhyme) You'll say a better Major-General has never sat a gee  For my military knowledge, though I'm plucky and adventury, Has only been brought down to the beginning of the century; But still, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General.";
  stringOne = stringOne.shuffle();
  stringTwo = stringTwo.shuffle();


  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);

  let [lengthDiffTwo, _2] = diffLinear(stringOne, stringTwo);

  t.is(lengthDiffOne, lengthDiffTwo);
});
