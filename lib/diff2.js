'use strict';

///////////////////////////////////
// Helper functions
///////////////////////////////////
const RED = '\x1b[31m';
const ENDCOLOUR = `\x1b[0m`;
const GREEN = '\x1b[32m';

Array.prototype.last = function(){
  return this[this.length-1];
};

function between(x, lower, higher){
  return (x >= lower && x <= higher);
}

function isOdd(n){
  return (n + 1) % 2 === 0;
}

function isEven(n){
  return n % 2 === 0;
}

function backward({first,
                   second,
                   d,
                   k,
                   delta,
                   reverseV,
                   MAX}){
  let x;
  let y;
  let xStart;
  let yStart;
  let kr = k+delta;
  // For reverse we really need to think about what k+1 means and what k-1 means.
  // and what it means in terms of x being higher or lower.
  // I think in the reverse we want to minimize x as we progress. So we always choose
  // the direction that has the *smallest* x
  let up = (k === d || (k !== -d && reverseV[MAX + k - 1] < reverseV[MAX + k + 1]));
  if (up) {
    // console.log("choosing insert");
    xStart = reverseV[MAX + k - 1];
  } else {
    // console.log("choosing delete");
    xStart = reverseV[MAX + k + 1];
  }
  // Once we know our x and which diagonal we are on we can calculate which y value we are on in the edit graph
  // yStart = xStart - (up ? (k - 1) : (k + 1));
  yStart = xStart - (up ? kr: kr + 1);
  x = up ? xStart : xStart - 1 ;
  y = x - kr;

  // As long as we stay in the edit graph we want to find the longest share subsequence between
  // strings A and B
  while (x > 0 && y > 0 && first[x-1] === second[y-1]){
    x--;
    y--;
  }

  // Once we have reached the end of our edit graph we can log how far we've made it
  return {x: x, y:y, u: xStart, v: yStart};
};

function forward({first,
                  second,
                  d,
                  k,
                  v,
                  MAX,
                  N,
                  M}){
  let x, xStart;
  let y, yStart;

  let down = (k === -d || (k !== d && v[MAX+k - 1] < v[MAX + k + 1]));
  if (down) {
    xStart = v[MAX + k + 1];
  } else {
    xStart = v[MAX + k - 1];
  }
  // Once we know our x and which diagonal we are on we can calculate which y value we are on in the edit graph
  yStart = xStart - (down ? k + 1 : k - 1);
  x = down ? xStart : xStart + 1;
  y = x - k;
  // As long as we stay in the edit graph we want to find the longest share subsequence between
  // strings A and B
  while (x < N && y < M && first[x] === second[y]){
    x++;
    y++;
  }

  // Once we have reached the end of our edit graph we can log how far we've made it
  return {x: xStart, y:yStart, u: x, v: y};
}
///////////////////////////////////
// Main algorithm
///////////////////////////////////

// Divide and Conquery version of the Meyers shortest
// edit sequence algorithm
function middleSnake(first, second){
  // set constants to match algo
  const N = first.length;
  const M = second.length;
  const MAX = N + M;
  const delta = N-M;
  // create array v that will contain the furthest reaching coordinates at a difference of
  // v[d]
  // In this array we only store the value of x, as we can generate the value y with the equation
  // y = v[i] +/- i
  let v = new Array(3*MAX+1);
  let reverseV = new Array(3*MAX+1);
  v[MAX+ 1] = 0;
  reverseV[MAX-1] = N;

  for(let d=0; d <= Math.ceil(MAX/2); d++){
    // Forward

    for(let k=-d; k <= d; k=k+2){
      let obj = ({first: first,
                  second: second,
                  d: d,
                  k: k,
                  delta: 0,
                  v: v,
                  MAX: MAX,
                  N: N,
                  M: M});
      let fms= forward(obj);
      // A middle snake can be described as two points (x, y) and (u, v)
      // in a forward middle snakes we're concerned with u as it describes
      // how far we were able to traverse up string one with x

      v[MAX + k] = fms.u;
      if((isOdd(delta)) && between(k,
                                   (delta - (d-1)), // Clojure has ruined me
                                   (delta + (d-1)))){ // Ruined me
        // if(!reverseV[MAX + k - delta]){
        //   let obj = {first: first,
        //              second: second,
        //              d: d,
        //              k:k ,
        //              delta: -delta,
        //              reverseV: reverseV,
        //              MAX: MAX,
        //              N: N,
        //              M: M};
        //   let rms = backward(obj);
        //   reverseV[MAX + k - delta] = rms.x;
        // }
        if(v[MAX + k] >= reverseV[MAX + k - delta]){
          return [(2 * d) - 1, 0, fms];
        }
      }
    }

    // Reverse
    for(let k = -d; k <= d; k= k+2){
      let obj ={first: first,
                second: second,
                d: d,
                k:k ,
                delta: delta,
                reverseV: reverseV,
                MAX: MAX,
                N: N,
                M: M};
      let rms = backward(obj);
      // likewise in a reverse middle snake we care about x as that describes how far
      // we've made it in the reverse direction
      reverseV[MAX+k] = rms.x;

      if(isEven(delta) && between(k + delta, -d, d)){
        if( rms.x <= v[MAX + k+delta]){
          return [2 * d, k, rms];
        }
      }
    }
  }
  //Error case
  console.log("Returning error");
  throw new Error;
  return [-1, 0, []];
};

function determineAction({x, y, u, v}){
  // Given a middle snake we can determine if it's an action based on the difference on the x axis or y axis being greater
  let xDiff = u-x;
  let yDiff = v-y;
  if (yDiff == xDiff){
    return [null, 0];
  } else if(yDiff > xDiff){
    return ["insert", y];
  } else {
    return ["delete", x];
  }
}

function mergeActions(first, second){
  return {
    "insert": first["insert"].concat(second["insert"]),
    "delete": first["delete"].concat(second["delete"])
  };
}

function translateCoordinates({x, y, u, v}, xOffset, yOffset){
  return {
    x: x + xOffset,
    y: y + yOffset,
    u: u + xOffset,
    v: v + yOffset,
  };
}
function diff(first, N, firstOffset, second, M, secondOffset){
  let actions = {insert: [],
                 delete: []};
  if (N > 0 && M > 0){
    let [difference, k, {x,y,u,v}] = middleSnake(first, second); // not sure why we need k yet
    // By ignoring all the diff that is returned from all child differences, we are gauranteed that
    // when grandparent diff2 returns, it is the highest diff.

    let action = determineAction(translateCoordinates({x, y, u, v}, firstOffset, secondOffset));
    // console.log(first);
    // console.log(second);
    // console.log(firstOffset);
    // console.log(secondOffset);
    // console.log({x,y,u,v});
    // console.log(action);
    if(action[0] !== null){
      actions[action[0]].push(action[1]);
    }
    if(difference == 0){
      return [0, {"insert": [],
                  "delete": []}];
    }
    if(difference > 1){
      let [_, forwardActions] = diff2(first.slice(0, x), x, firstOffset, second.slice(0, y), y, secondOffset);
      actions = mergeActions(forwardActions, actions);
      let [_1, reverseActions] = diff2(first.slice(u, N), N-u, (firstOffset + u), second.slice(v, M), M-v, (secondOffset + v));
      actions = mergeActions(actions, reverseActions);
    }
    return [difference, actions];
  } else if (N > 0){
    console.log(first);
    return [N, {"insert": [],
                "delete": first.split("").map((_, index) => {
                  console.log(index + firstOffset);
                  return index + firstOffset;})}];
  } else if (M > 0){
    console.log(second);

    return [M, {"insert": second.split("").map((_, index) => {
      console.log(index + secondOffset);
      return index + secondOffset;}),
                "delete": []}];
  } else{
    return [0, {"insert": [],
                "delete": []}];
  }
};

function diffLinear(string1, string2){
  return diff(string1, string1.length, 0, string2, string2.length, 0);
}


function concatEditGraph(editGraph){
  // simplifies and edit graph into a series of operation that describes ranges of deletes
  // or inserts
  let simplifiedEditGraph = {delete: [],
                             insert:[]
                            };
  let previousEdit=null;
  let series =  false; // a series of edits or inserts
  Object.keys(editGraph).forEach((key)=>{
    editGraph[key].forEach(function(editPoint){
      if(previousEdit === editPoint - 1){
        let editRange = simplifiedEditGraph[key].last();
        editRange["to"] = editPoint;

      }else{
        let editRange = {"from": editPoint,
                         "to": editPoint};
        simplifiedEditGraph[key].push(editRange);
      }
      previousEdit = editPoint;
    });
  });
  return simplifiedEditGraph;
}

exports.shortestEditSequenceDC = middleSnake;
exports.diffLinear = diffLinear;

function prettyPrintString(string, simplifiedEdits, type){
  const COLOUR = type === "insert"? GREEN : RED;
  let newString = "";
  let from;
  let to;

  let edit = simplifiedEdits.shift();

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
