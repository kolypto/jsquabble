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

or with SSL:

```
$ sudo certbot certonly --standalone --preferred-challenges http -d jsquabble.ddns.net
$ docker run -it --rm -p 443:8000 -v $(realpath cert/):/app/cert kolypto/jsquabble uvicorn jsquabble.main:app --host=0.0.0.0 --ssl-keyfile=cert/privkey.pem --ssl-certfile=cert/cert.pem
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

