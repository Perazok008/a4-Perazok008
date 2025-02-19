import { useState, useEffect, useRef } from "react";
import { useSession, signOut, signIn } from "next-auth/react";

function DataForm() {
  // State management
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    email: "",
    dob: "",
  });
  const newUserNotifiedRef = useRef(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Check if user logged in locally
  const isLocal = session?.user?.provider === "local";

  // Effects
  useEffect(() => {
    // Load user data
    if (session) {
      async function fetchUser() {
        try {
          const res = await fetch("/api/users/loaduser", {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            setFormData((prev) => ({ ...prev, ...data.user }));
          } else {
            const errorData = await res.json();
            console.error("Error loading user:", errorData.error);
            // Optionally show error in UI
            setNotification({
              message: `Failed to load user data: ${errorData.error}`,
              type: "error"
            });
          }
        } catch (err) {
          console.error("Error fetching user:", err);
          setNotification({
            message: "Failed to load user data",
            type: "error"
          });
        }
      }
      fetchUser();
    }
  }, [session]);

  useEffect(() => {
    // New user notification
    if (session?.user?.isNew && !newUserNotifiedRef.current) {
      newUserNotifiedRef.current = true;
      alert("New user created!");
    }
  }, [session]);

  useEffect(() => {
    // Auto-dismiss notifications
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000); // Dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // API interaction functions
  async function updateUser() {
    try {
      const res = await fetch("/api/users/updateuser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, ...data.user }));
        setNotification({ 
          message: "User updated successfully!", 
          type: "success" 
        });

        // If username was updated, refresh the session
        if (data.user.username && data.user.username !== session.user.username) {
          await signIn("credentials", {
            redirect: false,
            username: data.user.username,
            password: data.user.password,
          });
        }
      } else {
        const errorData = await res.json();
        setNotification({ 
          message: `Update failed: ${errorData.error}`, 
          type: "error" 
        });
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setNotification({ 
        message: "Update failed: Internal server error", 
        type: "error" 
      });
    }
  }

  async function deleteUser() {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const res = await fetch("/api/users/deleteuser", {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          alert(data.message);
          signOut({ callbackUrl: '/' });
        } else {
          const errorData = await res.json();
          alert(`Delete failed: ${errorData.error}`);
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Delete failed: Internal server error");
      }
    }
  }

  // Render form
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await updateUser();
      }}
      id="data-form"
      className="form-container"
    >
      {/* Add GitHub username header if logged in via GitHub */}
      {session?.user?.provider === "github" && (
        <div className="github-header">
          <h2 className="text-xl font-semibold mb-4">
            Welcome, {session.user.username} (GitHub)
          </h2>
        </div>
      )}

      <label htmlFor="fullName" className="form-label">
        Full Name:
      </label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        autoComplete="name"
        className="form-input"
        value={formData.fullName}
        onChange={(e) =>
          setFormData({ ...formData, fullName: e.target.value })
        }
      />

      {isLocal && (
        <>
          <label htmlFor="username" className="form-label">
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            required
            className="form-input"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <label htmlFor="password" className="form-label">
            Password:
          </label>
          <input
            type="text"
            id="password"
            name="password"
            autoComplete="new-password"
            required
            className="form-input"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </>
      )}

      <label htmlFor="email" className="form-label">
        Email:
      </label>
      <input
        type="email"
        id="email"
        name="email"
        autoComplete="email"
        className="form-input"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
      />

      <label htmlFor="dob" className="form-label">
        DOB:
      </label>
      <input
        type="date"
        id="dob"
        name="dob"
        autoComplete="bday"
        className="form-input"
        value={formData.dob}
        onChange={(e) =>
          setFormData({ ...formData, dob: e.target.value })
        }
      />

      <button type="submit" className="button primary-button">
        Update
      </button>
      <button
        id="logout-btn"
        type="button"
        className="button secondary-button"
        onClick={() => signOut({ callbackUrl: '/' })}
      >
        Sign Out
      </button>
      
      <button
        id="delete-btn"
        type="button"
        className="button danger-button"
        onClick={deleteUser}
      >
        Delete Account
      </button>

      {notification.message && (
        <div className={`mt-4 p-2 rounded ${
          notification.type === 'success' 
            ? 'bg-green-200 text-green-800' 
            : 'bg-red-200 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}
    </form>
  );
}

export default DataForm;