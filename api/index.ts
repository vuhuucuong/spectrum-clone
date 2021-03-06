import express from 'express';
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';
import mongoose from 'mongoose';

import models from './models'
import typeDefs from './gql/typedefs'
import resolvers from './gql/resolvers'
import cfg from './cfg'
import seedInitialData from './seed';

mongoose.connect(cfg.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
mongoose.connection.once('open', async () => {
  try {
    await seedInitialData()
    const app = express();
    const schema = makeExecutableSchema({ typeDefs, resolvers })
    const server = new ApolloServer({
      schema,
      context: { models }
    });
    server.applyMiddleware({ app });

    app.listen({ port: cfg.PORT }, () =>
      console.log(`🚀 Server ready at http://localhost:${cfg.PORT}${server.graphqlPath}`)
    )
  } catch (err) {
    console.error(err)
  }
}).on("error", console.error.bind(console, 'connection error:'))