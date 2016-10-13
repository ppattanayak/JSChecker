# JSLint

## Requirement

1. npm install jslint --save

## Introduction

This plugin uses JSLint to find errors and bad practices in the JavaScript code and display it back to the user, in a user friendly HTML.

## Limitation

This plugin is limited to the JSLint capabilities.

## Sample Response

```
{"jslint":{"status":true,"result":[{"name":"JSLintError","column":0,"line":0,"code":"undeclared_a","a":"console","message":"Undeclared 'console'."},{"name":"JSLintError","column":14,"line":1,"code":"undeclared_a","a":"document","message":"Undeclared 'document'."},{"name":"JSLintError","column":0,"line":3,"code":"undeclared_a","a":"document","message":"Undeclared 'document'."}],"headerName":"JSLint"}
```
