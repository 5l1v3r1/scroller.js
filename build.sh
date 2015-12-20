#!/bin/bash

rm -rf build
mkdir build
jsbuild -license=LICENSE -version=`cat VERSION` -name="scrollerjs" -output="build/scroller.js" src/*.js
cat css/*.css >build/scrollerjs.css
