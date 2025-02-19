import { useSession } from "next-auth/react";
import LoginForm from "../components/LoginForm.js";
import DataForm from "../components/DataForm.js";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <header className="text-center bg-accent/90 font-bold p-4">
        <h1 className="text-4xl">Gleb Vlasov</h1>
        <h2 className="text-xl">A4 - Student Registry with Next</h2>
        <h3 className="text-lg">For CS4241-C25</h3>
      </header>

      <main className="flex flex-col items-center">
        {!session && <LoginForm />}
        {session && <DataForm />}
      </main>
    </>
  );
}