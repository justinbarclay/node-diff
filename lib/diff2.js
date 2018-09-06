'use strict';

///////////////////////////////////
// Helper functions
///////////////////////////////////
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
  yStart = xStart - (up ? kr - 1: kr + 1);
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
        if(!reverseV[MAX + k]){
          let obj = {first: first,
                     second: second,
                     d: d,
                     k:k ,
                     delta: delta,
                     reverseV: reverseV,
                     MAX: MAX,
                     N: N,
                     M: M};
          let rms= backward(obj);
          reverseV[MAX + k] = rms.x;
        }
        if(fms.u >= reverseV[MAX + k]){
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
function diff2(first, N, firstOffset, second, M, secondOffset){
  let actions = {"insert": [],
                 "delete": []};
  if (N > 0 && M > 0){
    let [difference, k, {x, y, u, v}] = middleSnake(first, second); // not sure why we need k yet

    // By ignoring all the diff that is returned from all child differences, we are gauranteed that
    // when grandparent diff2 returns, it is the highest diff.

    let action = determineAction({x,y,u,v});
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
      let [_1, reverseActions] = diff2(first.slice(u+1, N), N-u, u+1, second.slice(v+1, M), M-v, v+1);
      actions = mergeActions(actions, reverseActions);
    }
    return [difference, actions];
  } else if (N > 0){
    return [N, {"insert": [],
                "delete": first.split().map((_, index) => {return index + firstOffset;})}];
  } else if (M > 0){
    return [M, {"insert": second.split().map((_, index) => {return index + secondOffset;}),
                "delete": []}];
  } else{
    return [0, {"insert": [],
                "delete": []}];
  }
};


exports.shortestEditSequenceDC = middleSnake;
exports.diff2 = diff2;

// console.log(diff2("", 6, "l", 4));
let string1 = "h";
let string2 = "hey";
// var ms = middleSnake(string1, string2)[2];
// var action = determineAction(ms);
// console.log(ms);
// console.log(action);
// if(action[0] == "insert"){
//   console.log(string2[action[1]]);
// } else if (action[0] == "delete"){
//   console.log(string1[action[1]]);
// }
console.log(`comparing "${string1}" and "${string2}"`);
console.log(diff2(string1, 1, 0, string2, 3, 0));


string2 = "h";
string1 = "hey";
console.log(`comparing "${string1}" and "${string2}"`);
console.log(diff2(string1, 3, 0, string2, 1, 0));
