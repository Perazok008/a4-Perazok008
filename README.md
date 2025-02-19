# A4 - Student Registry with Next.js
Link: https://a4-perazok008.vercel.app

This application is built using Next.js and showcases its full-stack capabilities. It uses Next.js API routes to handle backend logic (such as user authentication, data updates, and deletions) alongside React components for the client-side interface. The app uses next-auth to implement  authentication with both local credentials and GitHub OAuth. Server-side session retrieval using getServerSession ensures secure and consistent access to user data across API calls. Next.js routing and SSR features provide a seamless and efficient user experience.

## Implemented Features

 - **Authentication:** Supports both local credentials and GitHub OAuth via next-auth.
 - **User Management:** Users can update their profile (full name, username, password, email, DOB) and delete their account.
 - **Dynamic Session Refresh:** If the username is updated, the session is refreshed automatically.
 - **Secure API Routes:** Uses getServerSession for server-side session retrieval in API routes.
 - **MongoDB Integration:** Stores and manages user data using a MongoDB database.
 - **Responsive UI:** Built with Next.js components and styled with Tailwind CSS custom, adaptive theme.