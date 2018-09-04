const { PerformanceObserver, performance } = require('perf_hooks');
let { diff, concatEditGraph, printAverageTime, shortestEditSequence2, shortestEditSequence } = require('../lib/diff.js');
let { diff2, shortestEditSequenceDC } = require('../lib/diff2.js');
let fs = require('fs');
let process = require('process');

import test from 'ava';


function reverseString(str) {
  return str.split("").reverse().join("");
}
// TESTING DIFF1 AND DIFF 2

/////////////////////////////////////////////////////
// SMALL STRINGS
// To ensure fundamentals
/////////////////////////////////////////////////////

test('Should find a difference of 2, on an even delta', t => {
  let stringOne = "a";
  let stringTwo = "b";
  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);
  let [lengthDiffTwo, _2] = diff2(stringOne,stringOne.length,  stringTwo, stringTwo.length);
  t.is(lengthDiffOne, lengthDiffTwo);
});

test('Should find 0 difference, for strings of an even delta', t => {
  let stringOne = "aa";
  let stringTwo = "aa";
  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);
  let [lengthDiffTwo, _2] = diff2(stringOne,stringOne.length,  stringTwo, stringTwo.length);
  t.is(lengthDiffOne, lengthDiffTwo);
});

test('Should find 0 difference with an even delta', t => {
  let stringOne = "a";
  let stringTwo = "a";
  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);
  let [lengthDiffTwo, _2] = diff2(stringOne,stringOne.length,  stringTwo, stringTwo.length);
  t.is(lengthDiffOne, lengthDiffTwo);
});

test('Should find 2 difference with an even delta', t => {
  let stringOne = "aa";
  let stringTwo = "aacc";
  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);
  let [lengthDiffTwo, _2] = diff2(stringOne,stringOne.length,  stringTwo, stringTwo.length);
  t.is(lengthDiffOne, lengthDiffTwo);
});

test('Should find 1 difference with an odd delta', t => {
  let stringOne = "abcd";
  let stringTwo = "abc";
  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);
  let [lengthDiffTwo, _2] = diff2(stringOne,stringOne.length,  stringTwo, stringTwo.length);
  t.is(lengthDiffOne, lengthDiffTwo);
});

test('Should find 2 differences with an even delta', t => {
  let stringOne = "abc";
  let stringTwo = "abcde";
  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);
  let [lengthDiffTwo, _2] = diff2(stringOne,stringOne.length,  stringTwo, stringTwo.length);
  t.is(lengthDiffOne, lengthDiffTwo);
});

test('Should find 1 difference with a delta of 1', t => {
  let stringOne = "ab";
  let stringTwo = "a";
  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);
  let [lengthDiffTwo, _2] = diff2(stringOne,stringOne.length,  stringTwo, stringTwo.length);
  t.is(lengthDiffOne, lengthDiffTwo);
});

test('Should find 3 differences with a delta of 1', t => {
  let stringOne = "fe";
  let stringTwo = "l";
  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);
  let [lengthDiffTwo, _2] = diff2(stringOne,stringOne.length,  stringTwo, stringTwo.length);
  t.is(lengthDiffOne, lengthDiffTwo);
});

test('Should find 3 differences with a delta of 1, part 2', t => {
  let stringOne = "l";
  let stringTwo = "fe";
  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);
  let [lengthDiffTwo, _2] = diff2(stringOne,stringOne.length,  stringTwo, stringTwo.length);
  t.is(lengthDiffOne, lengthDiffTwo);
});

/////////////////////////////////////////////////////
// LARGE STRINGS
// To ensure operating on larger scales
/////////////////////////////////////////////////////

test('diff1 and diff2 find a diff 0 for really long strings', t => {
  let stringOne = "I am the very model of a modern Major-General, I've information vegetable, animal, and mineral, I know the kings of England, and I quote the fights historical From Marathon to Waterloo, in order categorical I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical, About binomial theorem I'm teeming with a lot o' news, (bothered for a rhyme) With many cheerful facts about the square of the hypotenuse. I'm very good at integral and differential calculus; I know the scientific names of beings animalculous: In short, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General. I know our mythic history, King Arthur's and Sir Caradoc's; I answer hard acrostics, I've a pretty taste for paradox, I quote in elegiacs all the crimes of Heliogabalus, In conics I can floor peculiarities parabolous; I can tell undoubted Raphaels from Gerard Dows and Zoffanies, I know the croaking chorus from The Frogs of Aristophanes! Then I can hum a fugue of which I've heard the music's din afore, (bothered for a rhyme) And whistle all the airs from that infernal nonsense Pinafore  Then I can write a washing bill in Babylonic cuneiform, And tell you ev'ry detail of Caractacus's uniform: In short, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General  In fact, when I know what is meant by 'mamelon' and 'ravelin', When I can tell at sight a Mauser rifle from a javelin, When such affairs as sorties and surprises I'm more wary at, And when I know precisely what is meant by 'commissariat', When I have learnt what progress has been made in modern gunnery, When I know more of tactics than a novice in a nunnery – In short, when I've a smattering of elemental strategy – (bothered for a rhyme) You'll say a better Major-General has never sat a gee  For my military knowledge, though I'm plucky and adventury, Has only been brought down to the beginning of the century; But still, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General.";
  let stringTwo = "I am the very model of a modern Major-General, I've information vegetable, animal, and mineral, I know the kings of England, and I quote the fights historical From Marathon to Waterloo, in order categorical I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical, About binomial theorem I'm teeming with a lot o' news, (bothered for a rhyme) With many cheerful facts about the square of the hypotenuse. I'm very good at integral and differential calculus; I know the scientific names of beings animalculous: In short, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General. I know our mythic history, King Arthur's and Sir Caradoc's; I answer hard acrostics, I've a pretty taste for paradox, I quote in elegiacs all the crimes of Heliogabalus, In conics I can floor peculiarities parabolous; I can tell undoubted Raphaels from Gerard Dows and Zoffanies, I know the croaking chorus from The Frogs of Aristophanes! Then I can hum a fugue of which I've heard the music's din afore, (bothered for a rhyme) And whistle all the airs from that infernal nonsense Pinafore  Then I can write a washing bill in Babylonic cuneiform, And tell you ev'ry detail of Caractacus's uniform: In short, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General  In fact, when I know what is meant by 'mamelon' and 'ravelin', When I can tell at sight a Mauser rifle from a javelin, When such affairs as sorties and surprises I'm more wary at, And when I know precisely what is meant by 'commissariat', When I have learnt what progress has been made in modern gunnery, When I know more of tactics than a novice in a nunnery – In short, when I've a smattering of elemental strategy – (bothered for a rhyme) You'll say a better Major-General has never sat a gee  For my military knowledge, though I'm plucky and adventury, Has only been brought down to the beginning of the century; But still, in matters vegetable, animal, and mineral, I am the very model of a modern Major-General.";
  stringTwo = reverseString(stringTwo);

  let [lengthDiffOne, _1] = diff(stringOne, stringTwo);
  let [lengthDiffTwo, _2] = diff2(stringOne,stringOne.length,  stringTwo, stringTwo.length);
  t.is(lengthDiffOne, lengthDiffTwo);
});
