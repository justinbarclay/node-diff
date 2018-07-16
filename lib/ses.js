'use strict';
// This file contains a prototype implementation of the diff algorithm
// outlined in the paper "An O(ND) Difference Algorithm and Its Variations∗"

////////////
// Array nicities
////////////

Array.prototype.last = function(){
  return this[this.length-1];
}

//////////
// Main Algorithm
//////////

// This function calculates the shortest amounts of edits it would
// take to make function one string equal the other string.
// If you subtract the number returned from this function
// from the length of first + the length of second
// you will get the longest common subsequence
// two strings share in common
function shortestEditSequence(first, second){
  // set constants to match algo
  const N = first.length;
  const M = second.length;
  const MAX = N + M;

  // create array v that will contain the furthest reaching coordinates at a difference of
  // v[d]
  // In this array we only store the value of x, as we can generate the value y with the equation
  // y = v[i] +/- i
  let v = new Array(2*MAX);
  v[MAX+ 1] = 0;
  let history = [];
  // Traverse a graph of MAX length M+N, If we traverse a graph M+N times
  // that implies two strings are completely different and too make them equal
  // we would have to compeltely delete one string and insert the other string
  // in it's place
  // If a value less than M+N is returned that implies that two strings contain
  // a common substring
  for(let d=0; d <= MAX; d++){
    // k is the set of all diagonals that can be represented by X differences. Where -k represents
    // a deletion in the edit graph and a positive k represents insertions in the edit graph.
    for(let k=-d; k <= d; k=k+2){
      // Make sure x and y are instantiated and available
      let x;
      let y;

      // We want to start off our search with whichever neighbour line has gotten the furthest. If the neighboring line
      // above us has gotten us the furthest, then we can move down in the edit graph (insert) and begin our search.
      // Otherwise we need to start from the line below us and move right on the edit graph (delete) to do that same.
      //(k === -d || (k !== d && getFromEndpointsArray(v, MAX, k - 1) < getFromEndpointsArray(v, MAX, k + 1)))
      let insertOrDelete = "";
      if (k === -d || (k !== d && v[MAX+k - 1] < v[MAX + k + 1])){
        insertOrDelete = "Insert";
        x = v[MAX + k+1];
      } else {
        insertOrDelete = "Delete";
        x = v[MAX+k-1]+1;
      }

      // Once we know our x and which diagonal we are on we can calculate which y value we are on in the edit graph
      y = x - k;

      // As long as we stay in the edit graph we want to find the longest share subsequence between
      // strings A and B
      while (x < N && y < M && first[x] === second[y]){
        x++;
        y++;
      }

      // Once we have reached the end of our edit graph we can log how far we've made it
      v[MAX+ k]=x;

      // and finally if x and y are at the boundaries of our edit graph we have found the shortest edit sequence.
      if (x >= N && y >= M){
        return [d, k, history];
      }
    }
    history.push(v.slice());
  }
  return [MAX+1, []];
};

// Recursive algorithm of shortestEditSequence, this aims to generate a object that describes how to transform
// string A into String B
function generateEditGraph(first, second, history, K, D){
  // set constants to match algo
  const N = first.length;
  const M = second.length;
  const MAX = N + M;

  if (D == -1){
    return [];
  }

  let vatD = history[D];

  if (!vatD){
    console.error("history at D is blank");
    return [];
  }

  let bestOperation = -1;
  let maxX = -1;
  let bestK = -1;
  // Because we're traversing our history. We know as we step back in the history that to get to our current K
  // it must be through either an insert or a delete. So it must be the K directly
  // above us or below us.

  // Let's find which operation, inserting or deleting gets us farther
  let options = [["delete", K-1], ["insert", K+1]];
  options.forEach(function([operation, position]){

    let x = vatD[MAX+position];
    let y = x - position;

    while (x < N && y < M && first[x] === second[y]){
      x++;
      y++;
    }

    if(x > maxX){
      bestK = position;
      maxX = x;
      bestOperation = operation;
    }
  });

  let operation = {};

  if (bestOperation === "insert"){
    let x = vatD[MAX+K+1];
    let y = x - (K+1);
    operation["type"] = "insert";
    operation["at"] = y;
    operation["char"] = second[y];

  } else if (bestOperation === "delete"){
    let x = vatD[MAX+K+1];
    operation["type"] = "delete";
    operation["at"] = x;
    operation["char"] = "";

  } else {
    console.error("Houston we have a problem");
  }

  let editGraph = generateEditGraph(first, second, history, bestK, D-1);
  editGraph.push(operation);

  return editGraph;
};

function concatEditGraph(editGraph){
  // simplifies and edit graph into a series of operation that describes ranges of deletes
  // or inserts
  let simplifiedEditGraph = {delete: [],
                             insert:[]
                            };
  let previousEdit={};
  let series =  false; // a series of edits or inserts

  editGraph.forEach(function(editPoint){
    if(previousEdit["type"] === editPoint["type"] &&
       previousEdit["at"] === editPoint["at"] - 1){
      let editRange = simplifiedEditGraph[editPoint["type"]].last();
      editRange["to"] = editPoint["at"];

    }else{
      let editRange = {"from": editPoint["at"],
                       "to": editPoint["at"]};
      simplifiedEditGraph[editPoint["type"]].push(editRange);
    }
    previousEdit = editPoint;
  });

  return simplifiedEditGraph;
}

function findShortestEditSequence(first, second){
  let [difference, k, history] = shortestEditSequence(first, second);
  let editGraph = generateEditGraph(first, second, history, k, difference-1);
  return [difference, editGraph];
}
exports.shortestEditSequence = shortestEditSequence;
exports.generateEditGraph = generateEditGraph;
exports.concatEditGraph = concatEditGraph;
exports.findShortestEditSequence = findShortestEditSequence;
