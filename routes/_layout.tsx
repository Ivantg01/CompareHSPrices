import { PageProps } from "$fresh/server.ts";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Sidebar from "../islands/Sidebar.tsx";

export default function Layout(
  { Component, state, url }: PageProps & {
    state: {
      user: { username?: string; isAdmin?: boolean };
    };
  },
) {
  const username: string = state.user?.username || "";
  const isAdmin: boolean = state.user?.isAdmin || false;

  return (
    <div className="layout">
      {/* Sidebar - Columna 1 */}
      <Sidebar username={username} isAdmin={isAdmin} />
      {/* Contenedor principal - Columna 2 */}
      <div className="main-content">
        <Header username={username} isAdmin={isAdmin} />
        <main className="p-4 flex-grow">
          <Component />
        </main>
        {/* Footer SOLO en columna 2 */}
      </div>
      <Footer />
    </div>
  );
}
