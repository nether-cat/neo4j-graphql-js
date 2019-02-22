[![CI status](https://circleci.com/gh/neo4j-graphql/neo4j-graphql-js.svg?style=shield&circle-token=d01ffa752fbeb43585631c78370f7dd40528fbd3)](https://circleci.com/gh/neo4j-graphql/neo4j-graphql-js) [![npm version](https://badge.fury.io/js/neo4j-graphql-js.svg)](https://badge.fury.io/js/neo4j-graphql-js) [![Docs link](https://img.shields.io/badge/Docs-GRANDstack.io-brightgreen.svg)](http://grandstack.io/docs/neo4j-graphql-js.html)

# neo4j-graphql.js

A GraphQL to Cypher query execution layer for Neo4j and JavaScript GraphQL implementations.

- [Read the docs](https://grandstack.io/docs/neo4j-graphql-js.html)
- [Read the changelog](https://github.com/neo4j-graphql/neo4j-graphql-js/blob/master/CHANGELOG.md)

_neo4j-graphql-js is in active development. There are rough edges and APIs may change. Please file issues for any bugs that you find or feature requests._

## Installation and usage

Install

```
npm install --save neo4j-graphql-js
```

### Usage

Start with GraphQL type definitions:

```javascript
const typeDefs = `
type Movie {
    title: String
    year: Int
    imdbRating: Float
    genres: [Genre] @relation(name: "IN_GENRE", direction: "OUT")
}
type Genre {
    name: String
    movies: [Movie] @relation(name: "IN_GENRE", direction: "IN")
}
`;
```

Create an executable schema with auto-generated resolvers for Query and Mutation types, ordering, pagination, and support for computed fields defined using the `@cypher` GraphQL schema directive:

```javascript
import { makeAugmentedSchema } from 'neo4j-graphql-js';

const schema = makeAugmentedSchema({ typeDefs });
```

Create a neo4j-javascript-driver instance:

```javascript
import { v1 as neo4j } from 'neo4j-driver';

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'letmein')
);
```

Use your favorite JavaScript GraphQL server implementation to serve your GraphQL schema, injecting the Neo4j driver instance into the context so your data can be resolved in Neo4j:

```javascript
import { ApolloServer } from 'apollo-server';

const server = new ApolloServer({ schema, context: { driver } });

server.listen(3003, '0.0.0.0').then(({ url }) => {
  console.log(`GraphQL API ready at ${url}`);
});
```

If you don't want auto-generated resolvers, you can also call `neo4jgraphql()` in your GraphQL resolver. Your GraphQL query will be translated to Cypher and the query passed to Neo4j.

```js
import { neo4jgraphql } from 'neo4j-graphql-js';

const resolvers = {
  Query: {
    Movie(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    }
  }
};
```

## Access Control

### Access Control Basics

GraphQL recommends implementing authorization/access control through the business logic layer. To accomplish this using `neo4j-graphql.js`, you can implement fine-grained access control within auto-generated queries and mutations by defining and passing generator functions in the `context` object under the `context.AccessControl` property. The structure of this property is as follows:

```javascript
import { typeIdentifiers, safeVar } from 'neo4j-graphql-js/dist/utils'

context.AccessControl = {
  nodeQuery: {
    aclFactory: (context, resolveInfo) => {
      const { typeName, variableName } = typeIdentifiers(resolveInfo.returnType);
      const safeVariableName = safeVar(variableName);
      return {
        matchStatements: ['MATCH (u:User {id: ${context.user.userID})'],
        mainHeader: '',
        whereStatements: [`(u)-[:CAN_READ]->(${safeVariableName})`]
      };
    },
    // Whitelist/Blacklist not yet implemented.
    Whitelist: [''],
    Blacklist: ['']
  },
  createMutation: { ... },
  updateMutation: { ... },
  deleteMutation: { ... },
  addRelationship: { ... },
  removeRelationship: { ... }
};
```

### Example (as envisioned)

Without defining any ACL function, the following GraphQL query:

```
{
  Movie(title: "River Runs Through It, A") {
    title
    year
    imdbRating
    actors {
      name
    }
  }
}
```

is translated into:

```
MATCH (movie:Movie {title:"River Runs Through It, A"})
RETURN movie { .title , .year , .imdbRating,
  actors: [(movie)<-[ACTED_IN]-(movie_actors:Actor) | movie_actors { .name }] }
AS movie
SKIP 0
```

With the ACL function defined above in the Access Control Basics subsection, it is translated into:

```
MATCH (u:User {id: YOURUSERID)
MATCH (movie:Movie {title:"River Runs Through It, A"}) WHERE (u)-[:CAN_READ]->(movie)
RETURN movie { .title , .year , .imdbRating,
  actors: [(movie)<-[ACTED_IN]-(movie_actors:Actor) | movie_actors { .name }] }
AS movie
SKIP 0
```

Alternatively, if the ACL function had been defined as follows:

```javascript
    aclFactory: (context, resolveInfo) => {
      return {
        matchStatements: [],
        mainHeader: `(u:User {id: ${context.user.userID})-[:CAN_READ]->`,
        whereStatements: []
      };
    }
```

It would have been translated into:

```
MATCH (u:User {id: YOURUSERID)-[:CAN_READ]->(movie:Movie {title:"River Runs Through It, A"})
RETURN movie { .title , .year , .imdbRating,
  actors: [(movie)<-[ACTED_IN]-(movie_actors:Actor) | movie_actors { .name }] }
AS movie
SKIP 0
```

## What is `neo4j-graphql.js`

A package to make it easier to use GraphQL and [Neo4j](https://neo4j.com/) together. `neo4j-graphql.js` translates GraphQL queries to a single [Cypher](https://neo4j.com/developer/cypher/) query, eliminating the need to write queries in GraphQL resolvers and for batching queries. It also exposes the Cypher query language through GraphQL via the `@cypher` schema directive.

### Goals

- Translate GraphQL queries to Cypher to simplify the process of writing GraphQL resolvers
- Allow for custom logic by overriding of any resolver function
- Work with `graphql-tools`, `graphql-js`, and `apollo-server`
- Support GraphQL servers that need to resolve data from multiple data services/databases
- Expose the power of Cypher through GraphQL via the `@cypher` directive

## Benefits

- Send a single query to the database
- No need to write queries for each resolver
- Exposes the power of the Cypher query langauge through GraphQL

## Test

We use the `ava` test runner.

```
npm install
npm build
npm test
```

The `npm test` script will run unit tests that check GraphQL -> Cypher translation and the schema augmentation features and can be easily run locally without a test environment. Full integration tests can be found in `/test` and are [run on CircleCI](https://circleci.com/gh/neo4j-graphql/neo4j-graphql-js) as part of the CI process.

## Examples

See [/examples](https://github.com/neo4j-graphql/neo4j-graphql-js/tree/master/example/apollo-server)

## [Documentation](http://grandstack.io/docs/neo4j-graphql-js.html)

Full docs can be found on [GRANDstack.io/docs](http://grandstack.io/docs/neo4j-graphql-js.html)
