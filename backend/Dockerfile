FROM python:3.9

# Application
WORKDIR /app/

# Install Poetry
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

# Install dependencies
COPY ./pyproject.toml ./poetry.lock /app/
ARG INSTALL_DEV=false
RUN bash -c "if [ $INSTALL_DEV == 'true' ] ; then poetry install --no-root ; else poetry install --no-root --no-dev ; fi"

# /app , user = nobody
WORKDIR /app/
USER nobody

# Put the app
# Do it in the end to leverage good Docker caching
ENV PYTHONPATH=/app:$PYTHONPATH
COPY ./ /app

# Run
EXPOSE 8000
CMD uvicorn jsquabble.main:app --host=0.0.0.0 --port 8000
