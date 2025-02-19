import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from "../../../lib/db";

const sendError = (res, status, message) => {
  return res.status(status).json({ error: message });
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendError(res, 405, `Method ${req.method} not allowed`);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return sendError(res, 401, "Unauthorized");
  }

  try {
    const usersCollection = await connectDB();
    if (!usersCollection) {
      return sendError(res, 500, "Database connection failed");
    }

    const user = await usersCollection.findOne({ 
      username: session.user.username 
    });
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Only remove password for non-local users
    if (session.user.provider === "local") {
      return res.status(200).json({ user });
    } else {
      const { password, ...safeUser } = user;
      return res.status(200).json({ user: safeUser });
    }
  } catch (err) {
    console.error("Error loading user:", err);
    return sendError(res, 500, "Internal server error");
  }
}
