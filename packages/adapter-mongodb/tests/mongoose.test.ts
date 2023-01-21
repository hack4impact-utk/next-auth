import { runBasicTests } from "@next-auth/adapter-test"
import { defaultCollections, format, MongoDBAdapter, _id } from "../src"
import mongoose from "mongoose"
import { MongoClient } from "mongodb"

const name = "test"
const mongoosePromise: Promise<mongoose.Mongoose> = mongoose.connect(
  `mongodb://localhost:27017/${name}`
)
const connectionPromise: Promise<mongoose.Connection> = mongoosePromise.then(
  (mongoose) => mongoose.connection
)

runBasicTests({
  adapter: MongoDBAdapter(connectionPromise),
  db: {
    async disconnect() {
      const client = (await connectionPromise).getClient()
      await client.db().dropDatabase()
      await client.close()
    },
    async user(id) {
      const client = (await connectionPromise).getClient()
      const user = await client
        .db()
        .collection(defaultCollections.Users)
        .findOne({ _id: _id(id) })

      if (!user) return null
      return format.from(user)
    },
    async account(provider_providerAccountId) {
      const client = (await connectionPromise).getClient()
      const account = await client
        .db()
        .collection(defaultCollections.Accounts)
        .findOne(provider_providerAccountId)
      if (!account) return null
      return format.from(account)
    },
    async session(sessionToken) {
      const client = (await connectionPromise).getClient()
      const session = await client
        .db()
        .collection(defaultCollections.Sessions)
        .findOne({ sessionToken })
      if (!session) return null
      return format.from(session)
    },
    async verificationToken(identifier_token) {
      const client = (await connectionPromise).getClient()
      const token = await client
        .db()
        .collection(defaultCollections.VerificationTokens)
        .findOne(identifier_token)
      if (!token) return null
      const { _id, ...rest } = token
      return rest
    },
  },
})
