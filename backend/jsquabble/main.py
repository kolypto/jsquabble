from __future__ import annotations

import asyncio
import os
import shelve
import threading
import typing
from _weakrefset import WeakSet
from typing import List, Optional

import strawberry
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.routing import Route, WebSocketRoute
from strawberry.asgi import GraphQL

# The file to save the answers to
ANSWERS_TXT = os.getenv('ANSWERS_TXT', '/tmp/answers.txt')

# The pickled database to save the answers to
ANSWERS_DB = os.getenv('ANSWERS_TXT', '/tmp/answers.db')


# Types

@strawberry.type
class Answer:
    """ An answer submitted by some player """
    question: int
    name: str
    answer: str
    score: Optional[int] = None


# Queries

@strawberry.type
class Query:
    @strawberry.field
    def all_answers(self) -> List[Answer]:
        """ Load all answers """
        return db_load_answers()


# Mutations

@strawberry.type
class Mutation:
    @strawberry.mutation
    def clear_answers(self) -> bool:
        """ Remove all answers from the database """
        db_reset()
        return True

    @strawberry.mutation
    def submit_answer(self, question: int, name: str, answer: str) -> bool:
        """ Submit an answer """
        # Construct an object
        answer = Answer(question=question, name=name, answer=answer)

        # Save
        db_add_answer(answer)

        # Put into the queue (where an admin may be listening)
        answer_broadcast(answer)

        return True

    @strawberry.mutation
    def answer_score(self, question: int, name: str, score: int) -> bool:
        """ Set a score for an answer """
        db_set_score(question, name, score)
        return True


# Subscription

@strawberry.type
class Subscription:
    @strawberry.subscription
    async def answer(self, info, lookback: bool = False) -> typing.AsyncGenerator[Answer, None]:
        """ Subscribe to new answers

        Args:
            lookback: Report old messages too; not just the new ones
        """
        # Get a queue to listen to
        queue = answers_add_listener()

        # Lookback
        if lookback:
            for answer in db_load_answers():
                queue.put_nowait(answer)

        # Report every new message
        while True:
            answer: Answer = await queue.get()
            yield answer



# Answers broadcast
answers_broadcast = WeakSet()


def answers_add_listener() -> asyncio.Queue:
    """ Register a new listener for new answers

    This function creates a Queue and returns it. While you're listening to it, and the object lives,
    new answers will be added to this queue. As soon as it's garbage-collected, a weakreference
    dies, and the queue is not used anymore.
    """
    queue = asyncio.Queue()
    answers_broadcast.add(queue)
    return queue


def answer_broadcast(answer: Answer):
    """ Broadcast a new answer to all available queues """
    for queue in answers_broadcast:
        queue.put_nowait(answer)


# Persistent storage

_answers_file_lock = threading.Lock()


def db_load_answers() -> List[Answer]:
    """ Load all stored answers from the DB """
    with _answers_file_lock, shelve.open(ANSWERS_DB, 'c') as db:
        return db.get('answers', [])


def db_add_answer(answer: Answer):
    """ Add another answer to the database """
    with _answers_file_lock:
        # Save to the txt file
        with open(ANSWERS_TXT, 'at') as f:
            f.write(f'#{answer.question} "{answer.name}" {answer.answer}\n')

        # Save to the db file
        with shelve.open(ANSWERS_DB, 'c', writeback=True) as db:
            db.setdefault('answers', [])
            db['answers'].append(answer)
            db.sync()


def db_set_score(question: int, name: str, score: int):
    """ Change the score of an answer """
    with shelve.open(ANSWERS_DB, 'c', writeback=True) as db:
        db.setdefault('answers', [])
        for answer in db['answers']:
            if answer.question == question and answer.name == name:
                answer.score = score
        db.sync()


def db_reset():
    """ Remove all answers from the database.

    The textual copy will remain.
    """
    with _answers_file_lock, shelve.open(ANSWERS_DB, 'c', writeback=True) as db:
        db.clear()


# Schema

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription,
)


# App
graphql_app = GraphQL(schema, keep_alive=True, keep_alive_interval=2)

routes = [
    Route('/', graphql_app),
    WebSocketRoute("/", graphql_app),  # <-- OMG!
]

middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*']),
]


app = Starlette(
    routes=routes,
    middleware=middleware,
)


