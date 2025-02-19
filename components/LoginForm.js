import { useState } from 'react';
import { signIn } from "next-auth/react";

function LoginForm() {
  // State
  const [error, setError] = useState(null);

  // Form submission handler
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    // Call NextAuth's signIn function with the "credentials" provider
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result.error) {
      setError(result.error);
    } else {
      // Handle successful login (e.g., redirect to a protected page)
      console.log("Login successful", result);
    }
  }

  // Render form
  return (
    <form onSubmit={handleSubmit} id="login-form" className="form-container">
        <h2 className="text-2xl font-semibold mb-4">Log In / Sign Up</h2>
        
        <label htmlFor="login-username" className="form-label">Username:</label>
        <input type="text" id="login-username" name="username" autoComplete="username" required
               className="form-input"/>

        <label htmlFor="login-password" className="form-label">Password:</label>
        <input type="password" id="login-password" name="password" autoComplete="current-password" required
               className="form-input"/>

        {error && <p className="text-red-600">{error}</p>}

        <button type="submit" className="button primary-button">
            Log In
        </button>

        <button type="button" className="button secondary-button" onClick={() => signIn("github")}>
            Log In with GitHub
        </button>
    </form>
  );
}

export default LoginForm;