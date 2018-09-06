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


function diff2(first, N, second, M){
  if (N > 0 && M > 0){
    if((N === 1 && M === 1)
       && first !== second){
      return [2, {delete: [first], insert: [second]}];
    }
    let [difference, k, middle_snake] = middleSnake(first, second);
    return [difference, -1];
    // Here I am, I am reasonably confident that that I have a working version of finding a
    // middle snake.
    // Now we need to think of a base case and a base case for this recursive algorithm
    // I think a decent base case is:
    // x == 0 and y == 0 || x == end and  y == end do nothing
    // x == 0 it's inserting 0 to y chars from second.
    // y == 0 it's deleting 0 -> x chars from first
    // x == N it's inserting y -> M chars from seconds
    // y == M  it's inserting x -> N chars from first
  }
};
exports.shortestEditSequenceDC = middleSnake;
exports.diff2 = diff2;
