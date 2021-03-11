#!/bin/bash

set -e 
echo
echo "pre-commit"

# see if the user is trying to merge a branch into the main branch #
branch=$(git rev-parse --abbrev-ref HEAD)
echo $branch
if [[ $2 == 'merge' ]]; then
	echo "merging branch"
	if [[ "$branch" == "main" ]]; then
		echo "  trying to merge into the 'main' branch"
		echo "  you should push the local branch to Azure"
		echo "  and merge to main using a pull request"
		echo
		exit 1
	fi
fi

# see if the user is trying to commit to the main branch
if [ "$branch" = "main" ]; then
	read -p "  You are about to commit to the main branch, are you sure? [y|n] " -n 1 -r < /dev/tty
	echo
	if echo $REPLY | grep -E '^[Yy]$' > /dev/null
	then
		exit 0 # commit will execute
	fi
	exit 1 # commit will not execute
fi

# is the current branch a direct child of the master branch?
echo "checking parent branch"
PARENT=$(git show-branch -a | grep --invert-match `git rev-parse --abbrev-ref HEAD` | grep -v origin | sed 's/.*\[\(.*\)\].*/\1/' | grep -v -e '^$' | grep -v "^----$")
echo "parent branch is $PARENT"

linter=$(npm run linter)
echo $linter

test=$(npm run test)
echo $test

coverage=$(npm run test:coverage)
echo $coverage

jsdoc=$(npm run jsdoc)
echo $jsdoc

echo "commit successful..."