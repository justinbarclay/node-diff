#!/usr/bin/env node
const RED = '\x1b[31m';
const ENDCOLOUR = `\x1b[0m`;
const { PerformanceObserver, performance } = require('perf_hooks');
let {findShortestEditSequence} = require('./lib/diff-rs/ses.js');
let fs = require('fs');
let process = require('process');

function red(string){
  return `\x1b[31m` + string + `\x1b[0m`;
}

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
    console.error(red("You need to specify two files. Ex: `$ index fileOne fileTwo` "));
    throw "Missing files";
  }
}

function main(){
  try{
    let [fileOne, fileTwo] = validateFiles(process.argv);
    console.log(findShortestEditSequence(fileOne, fileTwo));
  } catch(e){
    return;
  }
}

main();
