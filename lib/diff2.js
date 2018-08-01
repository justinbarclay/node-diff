function shortestEditSequence2(first, second){
  // set constants to match algo
  const N = first.length;
  const M = second.length;
  const MAX = N + M;
  const delta = Math.abs(N-M);
  let reverseFirst = first.split("").reverse().join("");
  let reverseSecond = second.split("").reverse().join("");

  // create array v that will contain the furthest reaching coordinates at a difference of
  // v[d]
  // In this array we only store the value of x, as we can generate the value y with the equation
  // y = v[i] +/- i
  let v = new Array(2*MAX);
  let reverseV = new Array(2*MAX);
  v[MAX+ 1] = 0;
  reverseV[MAX  + 1] = first.length;

  let forwardHistory = new Array(MAX);
  let reverseHistory = new Array(MAX);

  for(let d=0; d <= Math.ceil(MAX/2); d++){

    // Forward
    for(let k=-d; k <= d; k=k+2){
      let x;
      let y;
      if (k === -d || (k !== d && v[MAX+k - 1] < v[MAX + k + 1])){
        x = v[MAX + k + 1];
      } else {
        x = v[MAX + k - 1]+1;
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
      v[MAX + k] = x;

      if(isOdd(delta) && between(k,
                                 (delta - (d-1)), // Clojure has ruined me
                                 (delta + (d-1)))){ // Ruined me
        if(x >= reverseV[MAX + k]){
          return [(2 * d) - 1, 0, []];
        }
      }
    }

    // Reverse
    for(let k = -d ; k <= d; k=k+2){
      let x;
      let y;
      if (k === -d || (k !== d && reverseV[MAX + k - 1] < reverseV[MAX + k + 1])){
        x = reverseV[MAX + k + 1];
      } else {
        x = reverseV[MAX + k - 1] - 1;
      }
      // Once we know our x and which diagonal we are on we can calculate which y value we are on in the edit graph
      y = x - k;
      // console.log("X ", x);
      // console.log("Y ", y);

      // console.log("X ", reverseFirst[x]);
      // console.log("Y ", reverseSecond[y]);
      // As long as we stay in the edit graph we want to find the longest share subsequence between
      // strings A and B
      while (x > 0 && y > 0 && first[x] === second[y]){
        // console.log("X ", x);
        // console.log("Y ", y);
        x--;
        y--;
      }
      // Once we have reached the end of our edit graph we can log how far we've made it
      reverseV[MAX + k] = x;

      // Perf testing
      // GLOBAL_TIME_TRACKER["innerLoop"] += performance.now() - startK;

      if(isEven(delta) && between(k+delta, -d, d)){
        if(x <= v[MAX + k]){
          return [2 * d, 0, []];
        }
      }
    }
  }

  //Error case
  console.log("Returning error");
  return [-1, 0, []];
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
function diff2(first, second){
  let [difference, k, history] = shortestEditSequence2(first, second);
}

exports.shortestEditSequence2 = shortestEditSequence2;
