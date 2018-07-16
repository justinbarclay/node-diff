#!/bin/bash

node --prof index.js test/test.txt test/test2.txt
file=$(find isolate-*)
node --prof-process $file > processed.txt
rm $file
