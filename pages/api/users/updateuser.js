import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from "../../../lib/db";

// Error response helper
const sendError = (res, status, message) => {
  return res.status(status).json({ error: message });
};

export default async function handler(req, res) {
  // Method validation
  if (req.method !== "PUT") {
    return sendError(res, 405, `Method ${req.method} not allowed`);
  }

  // Session validation using getServerSession
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return sendError(res, 401, "Unauthorized");
  }

  // Database connection
  const usersCollection = await connectDB();
  if (!usersCollection) {
    return sendError(res, 500, "Database connection failed");
  }

  // Update logic
  try {
    // Destructure fields from the request body
    const { fullName, username, password, email, dob } = req.body;

    // Build an object containing only the fields that should be updated.
    // Allow updating username and password only for local users.
    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (username !== undefined && session.user.provider === "local") {
      updateFields.username = username;
    }
    if (password !== undefined && session.user.provider === "local") {
      updateFields.password = password;
    }
    if (email !== undefined) updateFields.email = email;
    if (dob !== undefined) updateFields.dob = dob;

    // Use the session username as the filter (old username stored in session)
    const filter = { username: session.user.username };
    const update = { $set: updateFields };

    // First update the document
    const result = await usersCollection.updateOne(filter, update);
    
    if (result.matchedCount === 0) {
      return sendError(res, 404, "User not found");
    }

    // Then fetch the updated document using the new username if it was updated
    const newFilter = updateFields.username ? 
      { username: updateFields.username } : 
      filter;

    const updatedUser = await usersCollection.findOne(newFilter);
    
    if (!updatedUser) {
      return sendError(res, 404, "User not found after update");
    }

    // Return the user data based on provider
    if (session.user.provider === "local") {
      return res.status(200).json({ 
        user: updatedUser,
        // Include these fields for session refresh
        username: updatedUser.username,
        password: updatedUser.password
      });
    } else {
      const { password: pwd, ...safeUser } = updatedUser;
      return res.status(200).json({ user: safeUser });
    }
  } catch (err) {
    console.error("Error updating user:", err);
    return sendError(res, 500, "Internal server error");
  }
}
