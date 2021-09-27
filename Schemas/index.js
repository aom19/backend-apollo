const graphql = require("graphql");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

const userData = require("../data.json");
const { transformUser } = require("./helper");

const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
} = graphql;

const userType = require("./TypeDefs/UserType");

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    getAllUsers: {
      type: new GraphQLList(userType),
      resolve: async (parrent, args) => {
        try {
          const users = await User.find();

          return users.map((user) => {
            return transformUser(user);
          });
        } catch (err) {
          console.log(err);
        }
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: userType,
      args: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const hashedPassword = await bcrypt.hash(args.password, 12);

        const user = new User({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          password: hashedPassword,
        });
        let newUser;

        try {
          const result = await user.save();
          newUser = transformUser(result);

          return newUser;
        } catch (err) {
          console.log(err);
        }
      },
    },
  },
});

module.exports = new graphql.GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
