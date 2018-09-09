#!/usr/bin/env node
const { PerformanceObserver, performance } = require('perf_hooks');
let { diffGreedy, printAverageTime } = require('./lib/diff.js');
let { diffLinear } = require('./lib/diff2.js');
let fs = require('fs');
let process = require('process');
let parseArgs = require('minimist');

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

function incrementalAverage(sample, avgObj){
  if(avgObj){
    let {average, count} = avgObj;
    average = average + (sample - average)/count++;
    return {average: average, count: count++};
  } else {
    return {average: sample, count: 1};
  }
}

function validateFiles([fileNameOne, fileNameTwo]){
  const RED = '\x1b[31m';
  const ENDCOLOUR = `\x1b[0m`;

  if(fileNameOne && fileNameTwo){
    try {
      let fileOne = fs.readFileSync(fileNameOne, 'utf8');
      let fileTwo = fs.readFileSync(fileNameTwo, 'utf8');
      return [fileOne, fileTwo];
    } catch(e) {
      console.error(`${RED}Error:`, e.stack);
      console.error(ENDCOLOUR);
      throw "Missing files";
    }
  } else {
    console.error(RED + "You need to specify two files. Ex: `$ index fileOne fileTwo` " + ENDCOLOUR);
    throw "Missing files";
  }
}

function prettyPrintString(string, editGraph, type){
  const RED = '\x1b[31m';
  const ENDCOLOUR = `\x1b[0m`;
  const GREEN = '\x1b[32m';

  const COLOUR = type === "insert"? GREEN : RED;
  let newString = "";
  let from;
  let to;
  let simplifiedEdits = editGraph[type];

  edit = simplifiedEdits.shift();

  for(let i=0; i< string.length; i++){
    if(edit && i === edit["from"]){
      newString += COLOUR;
    }
    newString += string[i];
    if(edit && i === edit["to"]) {
      newString += ENDCOLOUR;
      edit = simplifiedEdits.shift();
    }
  }

  return newString;
}

function prettyPrintInsertAndDelete(stringOne, stringTwo, editGraph){
  console.log(prettyPrintString(stringOne, editGraph, "delete"))
  console.log("---------");
  console.log(prettyPrintString(stringTwo, editGraph, "insert"));
}

function main(){
  try{
    let args = parseArgs(process.argv, {default: {'a': "linear"}})
    let algo = args["a"];
    let [fileOne, fileTwo] = validateFiles(args["_"].slice(2));

    let difference, editGraph;
    let avg;
    if(algo === "linear"){
      [difference, editGraph] = diffLinear(fileOne, fileTwo);
    } else if (algo === "greedy"){
      [difference, editGraph] = diffGreedy(fileOne, fileTwo);
    }
    prettyPrintInsertAndDelete(fileTwo, fileTwo, editGraph);
    console.log(`Average time is ${avg.average}`);
  } catch(error){
    console.log(error);
  }
}

main();
