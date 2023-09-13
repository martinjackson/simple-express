
# How to prep before a version release

## compare current code with last version release

see only the list of files that were changed:

```bash
$ git diff tag1 tag2 --stat
```

and then look at the differences for some particular file:

```bash
$ git diff tag1...tag2 -- some/file/name
```

For example:

```bash
git diff v1.0.51 HEAD --stat
```

![show the files that changed](<diff-tag-example 2023-09-13 111527.png>)

```bash
git diff v1.0.51 HEAD -- ../appServer.js
```
