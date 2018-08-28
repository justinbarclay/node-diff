#!/usr/bin/env node
const RED = '\x1b[31m';
const ENDCOLOUR = `\x1b[0m`;
const GREEN = '\x1b[32m';

const { PerformanceObserver, performance } = require('perf_hooks');
let { diff, concatEditGraph, printAverageTime, shortestEditSequence2, shortestEditSequence } = require('./lib/diff.js');
let { diff2, middleSnake } = require('./lib/diff2.js');
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
    // let [fileOne, fileTwo] = validateFiles(process.argv);
    // [difference, editGraph] = findShortestEditSequence(fileOne, fileTwo);
    // let start = performance.now();
    // [difference, _, _] = shortestEditSequence(fileOne, fileTwo);a
    // console.log("Diff 1 took " + (performance.now() - start) + "ms");

    // Trigger GC for more accurate benchmarking
    // global.gc();

    // start = performance.now();
    // [difference2, _, pointArray] = shortestEditSequenceDC(fileOne, fileTwo);
    // console.log("Diff 2 took " + (performance.now() - start) + "ms");
    // console.log("Middle Snake: ", pointArray);
    // console.log("diff1 == diff2? ", difference == difference2);

    // start = performance.now();
    // [difference2, _, pointArray] = shortestEditSequenceDC("feeeeed", "deeeeef");
    // console.log("Diff 2 took " + (performance.now() - start) + "ms");
    // console.log("Middle Snake: ", pointArray);
    // console.log("diff2 ", difference2);

    start = performance.now();
    [difference2, _] = diff2("ab",3, "a", 2);
    console.log("Diff 2 took " + (performance.now() - start) + "ms");
    // console.log("Middle Snake: ", pointArray);
    console.log("diff2 ", difference2);
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
}

main();
