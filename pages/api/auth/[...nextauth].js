import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import connectDB from "../../../lib/db";

// Provider configurations
const providers = {
  credentials: CredentialsProvider({
    name: "Credentials",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
      const usersCollection = await connectDB();
      if (!usersCollection) {
        throw new Error("Database connection failed");
      }

      // Find existing user
      const user = await usersCollection.findOne({ 
        username: credentials.username 
      });

      if (user) {
        return handleExistingUser(user, credentials);
      } else {
        return createNewUser(credentials, usersCollection);
      }
    }
  }),
  github: GitHubProvider({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
    async profile(profile) {
      const usersCollection = await connectDB();
      if (!usersCollection) {
        throw new Error("Database connection failed");
      }

      // Check if user exists using githubId
      let user = await usersCollection.findOne({ 
        githubId: profile.id 
      });

      // If user doesn't exist, create a new one
      if (!user) {
        const newUser = {
          provider: "github",
          email: profile.email,
          fullName: profile.name || "",
          username: profile.login,
          avatar: profile.avatar_url,
          githubId: profile.id,
          createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newUser);
        if (result.insertedId) {
          user = { ...newUser, _id: result.insertedId, isNew: true };
        }
      }

      return {
        id: user._id.toString(),
        name: user.fullName,
        email: user.email,
        image: user.avatar,
        provider: "github",
        username: user.username,
        isNew: user.isNew || false
      };
    }
  })
};

// Helper functions
function handleExistingUser(user, credentials) {
  if (user.password === credentials.password) {
    user.provider = "local";
    return user;
  }
  throw new Error("Invalid password");
}

async function createNewUser(credentials, usersCollection) {
  const newUser = {
    username: credentials.username,
    password: credentials.password,
    provider: "local"
  };

  const result = await usersCollection.insertOne(newUser);
  if (result.insertedId) {
    newUser._id = result.insertedId;
    return { ...newUser, isNew: true };
  }
  return null;
}

// NextAuth configuration
export const authOptions = {
  providers: [
    providers.credentials,
    providers.github
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id;
        token.username = user.username;
        token.provider = user.provider;
        token.isNew = user.isNew ? true : false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.provider = token.provider;
        session.user.isNew = token.isNew;
        token.isNew = false;
      }
      return session;
    }
  }
};

export default NextAuth(authOptions); 