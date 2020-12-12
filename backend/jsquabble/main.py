from starlette.applications import Starlette
from starlette.routing import Route
from starlette.graphql import GraphQLApp
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
import graphene

# Queries

class RootQuery(graphene.ObjectType):
    hello = graphene.String()

    def resolve_hello(root, info: graphene.ResolveInfo):
        return 'hey'

# Mutations

class SubmitAnswerMutation(graphene.Mutation):
    class Arguments:
        # The input arguments for this mutation
        question = graphene.Int(required=True)
        name = graphene.String(required=True)
        answer = graphene.String(required=True)

    # The class attributes define the response of the mutation
    ok = graphene.Field(graphene.Boolean)

    @classmethod
    def mutate(cls, root, info: graphene.ResolveInfo, question: int, name: str, answer: str):
        print(question, name, answer)
        return True


class RootMutation(graphene.ObjectType):
    submit_answer = SubmitAnswerMutation.Field()

# Subscriptions

class RootSubscription(graphene.ObjectType):
    count_seconds = graphene.Float(up_to=graphene.Int())

    @staticmethod
    async def subscribe_count_seconds(root, info, up_to):
        # DOES NOT WORK
        for i in range(up_to):
            yield 1.0




# GraphQL schema

schema = graphene.Schema(
    query=RootQuery,
    mutation=RootMutation,
    subscription=RootSubscription
)

# GraphQL app

graphql_app = GraphQLApp(
    schema,
    graphiql=True,
)

# Starlette app

routes = [
    Route('/', graphql_app)
]

middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*']),
]


app = Starlette(
    routes=routes,
    middleware=middleware,
)


