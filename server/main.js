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

Meteor.startup(() => {
  casual.seed(123);
  db.sync({ force: true }).then(() => {
    _.times(10, () => {
      return AuthorModel.create({
        firstName: casual.first_name,
        lastName: casual.last_name
      }).then((author) => {
        return author.createPost({
          title: 'A post by ${author.firstName}',
          text: casual.sentences(3)
        }).then((post) => {
          // create some View mocks
          return Views.rawCollection().update(
            { postId: post.id },
            { views: casual.integer(0, 100), postId: post.id },
            { upsert: true }
          )
        })
      })
    })
  })
})

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