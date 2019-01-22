import { Meteor } from 'meteor/meteor';
import { ApolloServer } from 'apollo-server-express';
import { WebApp } from 'meteor/webapp';
import { getUser } from 'meteor/apollo';
import casual from 'casual';
import _ from 'lodash';

import { AuthorModel, db } from '../imports/api/connectors';

import typeDefs from '../imports/api/schema';
import resolvers from '../imports/api/resolvers';


import { Views } from '../imports/api/tasks';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    user: await getUser(req.headers.authorization)
  })
})

server.applyMiddleware({
  app: WebApp.connectHandlers,
  path: '/graphql'
})

WebApp.connectHandlers.use('/graphql', (req, res) => {
  if(req.method === 'GET') {
    res.end()
  }
})