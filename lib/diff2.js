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

  console.log('\n--------------------------');
  console.log('Going Backward');
  console.log(`d=${d}, k=${k}`);
  let x;
  let y;
  let xStart;
  let yStart;

  // For reverse we really need to think about what k+1 means and what k-1 means.
  // and what it means in terms of x being higher or lower.
  // I think in the reverse we want to minimize x as we progress. So we always choose
  // the direction that has the *smallest* x
  console.log(reverseV);
  let up = (k === d + delta || (k !== -d + delta && reverseV[MAX + k - 1 - delta] < reverseV[MAX + k + 1 - delta]));
  if (up) {
    // console.log("choosing insert");
    xStart = reverseV[MAX + k - 1 - delta];
  } else {
    // console.log("choosing delete");
    xStart = reverseV[MAX + k + 1 - delta];
  }
  // Once we know our x and which diagonal we are on we can calculate which y value we are on in the edit graph
  // yStart = xStart - (up ? (k - 1) : (k + 1));
  yStart = xStart - k;
  x = up ? xStart : xStart - 1;
  console.log("let down = (k === -d || (k !== d && v[MAX+k - 1] < v[MAX + k + 1]));");
  console.log(`We are going ${up?"up": "left"}`);
  console.log(`X=${x}`);
  y = x - k;
  console.log(`y = x(${x}) - k(${k}))} = ${y}`);
  // As long as we stay in the edit graph we want to find the longest share subsequence between
  // strings A and B
  // console.log("reverseV: ", reverseV);
  // console.log("k: ",k);
  // console.log("d: ",d);
  // console.log("delta: ",delta);
  // console.log("x: ",x);
  // console.log("y: ",y);
  // console.log("Up = ", up);
  // console.log(first[x]);
  // console.log(second[y]);

  while (x > 0 && y > 0 && first[x] === second[y]){
    // console.log(first[x]);
    // console.log(second[y]);
    x--;
    y--;
  }
  console.log(`Found a spot both X and Y break on`);
  console.log(`x = ${x} or ${first}[${x}] = ${first[x]}`);
  console.log(`y = ${y} or ${second}[${y}] = ${second[y]}`);
  // Once we have reached the end of our edit graph we can log how far we've made it
  console.log(`setting reverseV[MAX + K] = ${x}`);
  console.log(`before: ${reverseV}`);
  return x;
};

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
  let v = new Array(2*MAX);
  let reverseV = new Array(2*MAX);
  v[MAX+ 1] = -1;
  reverseV[MAX  - 1] = first.length;
  console.log("Initialization: ");
  console.log(`First: ${first}`);
  console.log(`Second: ${second}`);
  console.log(`N: ${N}`);
  console.log(`M: ${M}`);
  console.log(`MAX: ${MAX}`);
  console.log(`Delta: ${delta}`);

  for(let d=0; d <= Math.ceil(MAX/2); d++){
    // Forward

    for(let k=-d; k <= d; k=k+2){
      console.log('\n\n\n----------------------------------------');
      console.log('Going Forward');
      console.log(`d=${d}, k=${k}`);
      let x;
      let y;

      let down = (k === -d || (k !== d && v[MAX+k - 1] < v[MAX + k + 1]));
      if (down) {
        x = v[MAX + k + 1];
      } else {
        x = v[MAX + k - 1]+1;
      }
      console.log("let down = (k === -d || (k !== d && v[MAX+k - 1] < v[MAX + k + 1]));");
      console.log(`We are going ${down?"down": "right"}`);
      console.log(`X=${x}`);
      // Once we know our x and which diagonal we are on we can calculate which y value we are on in the edit graph

      y = x - k;
      console.log(`y = x(${x}) - k(${k}))} = ${y}`);

      // As long as we stay in the edit graph we want to find the longest share subsequence between
      // strings A and B
      let xStart = x;
      let yStart = y;
      while (x < N && y < M && first[x] === second[y], first[x] !== undefined){
        x++;
        y++;
      }
      console.log(`Found a spot both X and Y break on`);
      console.log(`x = ${x} or ${first}[${x}] = ${first[x]}`);
      console.log(`y = ${y} or ${second}[${y}] = ${second[y]}`);
      // Once we have reached the end of our edit graph we can log how far we've made it
      console.log(`setting V[MAX + K] = ${x}`);
      console.log(`Before: ${v}`);
      v[MAX + k] = x;
      console.log(`After: ${v}`);

      console.log(`is delta odd?: ${isOdd(delta)}`);
      console.log(`is K between ${delta} - ${d} - 1 and ${delta} + ${d} - 1: ${between(k, (delta - (d-1)), (delta + (d-1)))}`);
      if((isOdd(delta)) && between(k,
                                   (delta - (d-1)), // Clojure has ruined me
                                   (delta + (d-1)))){ // Ruined me

        if (!reverseV[MAX+k]){
          reverseV[MAX + k] = backward({first: first,
                                        second: second,
                                        d: d,
                                        k:k + delta,
                                        delta: delta,
                                        reverseV: reverseV,
                                        MAX: MAX});
        }

        console.log(`reverseV: ${reverseV}`);
        console.log(`reverseV[MAX+k]: ${reverseV[MAX+k]}`);
        console.log(`Is x >= reverseV[MAX+K]?: ${(x >= reverseV[MAX + k])}`);
        console.log(`${x} >= ${reverseV[MAX+k]}` );
        if(x >= reverseV[MAX + k]){
          return [(2 * d) - 1, 0, [[xStart, yStart], [x, y]]];
        }
      }
    }

    // Reverse
    for(let k = -d + delta; k <= d + delta; k=k+2){
      console.log('\n--------------------------');
      console.log('Going Backward');
      console.log(`d=${d}, k=${k}`);
      let x;
      let y;
      let xStart;
      let yStart;

      // For reverse we really need to think about what k+1 means and what k-1 means.
      // and what it means in terms of x being higher or lower.
      // I think in the reverse we want to minimize x as we progress. So we always choose
      // the direction that has the *smallest* x

      let up = (k === d + delta || (k !== -d + delta && reverseV[MAX + k - 1 - delta] < reverseV[MAX + k + 1 - delta]));
      if (up) {
        // console.log("choosing insert");
        xStart = reverseV[MAX + k - 1 - delta];
      } else {
        // console.log("choosing delete");
        xStart = reverseV[MAX + k + 1 - delta];
      }
      // Once we know our x and which diagonal we are on we can calculate which y value we are on in the edit graph
      // yStart = xStart - (up ? (k - 1) : (k + 1));
      yStart = xStart - k;
      x = up ? xStart : xStart - 1;
      console.log("let down = (k === -d || (k !== d && v[MAX+k - 1] < v[MAX + k + 1]));");
      console.log(`We are going ${up?"up": "left"}`);
      console.log(`X=${x}`);
      y = x - k;
      console.log(`y = x(${x}) - k(${k}))} = ${y}`);
      // As long as we stay in the edit graph we want to find the longest share subsequence between
      // strings A and B

      while (x > 0 && y > 0 && first[x] === second[y] && first[x] !== undefined){
        x--;
        y--;
      }
      console.log(`Found a spot both X and Y break on`);
      console.log(`x = ${x} or ${first}[${x}] = ${first[x]}`);
      console.log(`y = ${y} or ${second}[${y}] = ${second[y]}`);
      // Once we have reached the end of our edit graph we can log how far we've made it
      console.log(`setting reverseV[MAX + K] = ${x}`);
      console.log(`before: ${reverseV}`);
      reverseV[MAX + k - delta] = x;
      console.log(`after: ${reverseV}`);


      console.log(`Is delta even?: ${isEven(delta)}`);
      console.log(`is k between -d and d: ${between(k, -d, d)}`);
      if(isEven(delta) && between(k, -d, d)){
        console.log(`${v[MAX+k]}`);
        console.log(`Is x <= v[MAX+K]?: ${(x <= v[MAX + k])}`);
        console.log(`${x} <= ${v[MAX+k]}` );
        if( x <= v[MAX + k]){
          return [2 * d, k,[[x, y], [xStart, yStart]]];
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
