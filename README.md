# Front-End

To publish a new version:

```
$ ng build --prod --output-path ../docs --base-href /jsquabble/ --source-map
$ cp ../docs/{index,404}.html
$ git add -A && git commit -m 'Publish'
$ git push
```

Now navigate to: <https://kolypto.github.io/jsquabble/>

# Back-End (docker)

To build it:

```
$ docker build . -t kolypto/jsquabble
$ docker push kolypto/jsquabble
```

Run the back-end:

```
$ docker run -p 80:8000 kolypto/jsquabble
```

# Back-End (manual)

To set up the environment:

```
$ poetry install
$ poetry shell
```

Run the back-end:

```
$ uvicorn jsquabble.main:app
```

