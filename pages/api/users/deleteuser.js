import { getSession } from "next-auth/react";
import connectDB from "../../../lib/db";

const sendError = (res, status, message) => {
  return res.status(status).json({ error: message });
};

export default async function handler(req, res) {
  // Only allow the DELETE method for this endpoint
  if (req.method !== "DELETE") {
    return sendError(res, 405, `Method ${req.method} not allowed`);
  }

  // Check session information to make sure the user is authenticated
  const session = await getSession({ req });
  if (!session) {
    return sendError(res, 401, "Unauthorized");
  }

  // Connect to the database
  const usersCollection = await connectDB();
  if (!usersCollection) {
    return sendError(res, 500, "Database connection failed");
  }

  try {
    // Delete the user matching the session username
    const filter = { username: session.user.username };
    const result = await usersCollection.deleteOne(filter);
    
    if (result.deletedCount === 1) {
      return res.status(200).json({ message: "User account successfully deleted" });
    } else {
      return sendError(res, 404, "User not found");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    return sendError(res, 500, "Internal server error");
  }
}
