from __future__ import annotations

import asyncio
import os
import shelve
import threading
from _weakrefset import WeakSet
from typing import List, Optional

import pydantic as pd
from fastapi import FastAPI


# The file to save the answers to
from fastapi.params import Query

ANSWERS_TXT = os.getenv('ANSWERS_TXT', '/tmp/answers.txt')

# The pickled database to save the answers to
ANSWERS_DB = os.getenv('ANSWERS_TXT', '/tmp/answers.db')


# Types

class Answer(pd.BaseModel):
    """ An answer submitted by some player """
    question: int
    name: str
    answer: str
    score: Optional[int] = None


# FastAPI application

app = FastAPI(
    debug=True,
    title='JSquabble',
)


# Queries

class AllAnswersResponse(pd.BaseModel):
    answers: List[Answer]

@app.get('/all_answers', response_model=AllAnswersResponse)
def all_answers():
    """ Load all answers """
    return {
        'answers': db_load_answers(),
    }


# Commands

@app.post('/answer')
def submit_answer(question: int = Query(...), name: str = Query(...), answer: str = Query(...)):
    """ Send an answer """
    # Construct an object
    answer = Answer(question=question, name=name, answer=answer)

    # Save
    db_add_answer(answer)

    # Put into the queue (where an admin may be listening)
    answer_broadcast(answer)

    return {'ok': True}


# TODO
# @strawberry.type
# class Mutation:
#     @strawberry.mutation
#     def clear_answers(self) -> bool:
#         """ Remove all answers from the database """
#         db_reset()
#         return True
#
#     @strawberry.mutation
#     def answer_score(self, question: int, name: str, score: int) -> bool:
#         """ Set a score for an answer """
#         db_set_score(question, name, score)
#         return True
#

# Subscription

# TODO


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
