# ACA Code Review Browser

Quick and dirty tool to simplify code reviews at Austin Coding Academy. 

## Usage

Fork and run `npm install` to install dependencies. 

Run `npm start` from project root to start the tool on [http://localhost:3000/](http://localhost:3000/)

## Deployment

To create a bundle, run `npm build`

## Known issues

- No pagination yet, so in case there is more than 100 results from Github API, pagination would have to be added
- Uses unauthenticated Github API, so there is a limit of 60 requests / h
