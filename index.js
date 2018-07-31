#!/usr/bin/env node
const RED = '\x1b[31m';
const ENDCOLOUR = `\x1b[0m`;
const GREEN = '\x1b[32m';

const { PerformanceObserver, performance } = require('perf_hooks');
let { findShortestEditSequence, concatEditGraph, printAverageTime, shortestEditSequence2 } = require('./lib/ses.js');
let fs = require('fs');
let process = require('process');

function validateFiles(args){
  let [fileNameOne, fileNameTwo] = args.slice(2);

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

function prettyPrintString(string, simplifiedEdits, type){
  const COLOUR = type === "insert"? GREEN : RED;
  let newString = "";
  let from;
  let to;

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

function main(){
  try{
    let [fileOne, fileTwo] = validateFiles(process.argv);
    [difference, editGraph] = findShortestEditSequence(fileOne, fileTwo);
    console.log("Difference ", difference);

    try {
      console.log(shortestEditSequence2("", "d"));
      console.log(shortestEditSequence2("", "de"));
      console.log(shortestEditSequence2("d", ""));
      console.log(shortestEditSequence2("dead", "Test"));
      console.log(shortestEditSequence2("ed", "ed"));
      console.log(shortestEditSequence2("de", "ed"));
      console.log(shortestEditSequence2("deeef", "feeed"));
      console.log(shortestEditSequence2("Test", "Tset"));
      console.log(shortestEditSequence2(fileOne, fileTwo));
      console.log(shortestEditSequence2("Test", fileTwo));
    } catch(error){
      console.log(error);
    }

    // simpleEdits = concatEditGraph(editGraph);

    // console.log("Original\n---");
    // console.log(prettyPrintString(fileOne, simpleEdits["delete"], "delete"));
    // console.log("---\n");

    // console.log("New\n---");
    // console.log(prettyPrintString(fileTwo, simpleEdits["insert"], "insert"));
    // console.log("---");

    // Perf testing
    // printAverageTime();
  } catch(e){
    return;
  }
}

main();
