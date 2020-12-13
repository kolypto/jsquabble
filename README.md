# Front-End

To publish a new version:

```
$ ng build --prod --output-path ../docs --base-href /jsquabble/
$ cp ../docs/{index,404}.html
$ git add -A && git commit -m 'Publish'
$ git push
```

Now navigate to: <https://kolypto.github.io/jsquabble/>

# Back-End

To set up the environment:

```
$ poetry install
$ poetry shell
```

Run the back-end:

```
$ uvicorn jsquabble.main:app
```

