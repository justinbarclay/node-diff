#!/bin/bash

node --prof index.js test.txt test2.txt
file=$(find isolate-*)
node --prof-process $file > processed.txt
rm $file
