#!/bin/zsh


git status | grep modified
if [ $? -eq 0 ]
then
    set -e
    git commit -am "updated on - $(date)"
    git push
else
    set -e
    echo "No changes, ready to publish."
fi

# update the patch level of the version number and git commit
npm version patch -m "release %s"
git push

npm publish --access=public

