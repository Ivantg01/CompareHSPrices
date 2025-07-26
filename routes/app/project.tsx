import ProjectSelectButtons from "../../islands/app/ProjectSelectButtons.tsx";
import { signal } from "@preact/signals";
import { Handlers, PageProps } from "$fresh/server.ts";
import ProjectManagement from "../../islands/app/ProjectManagement.tsx";

interface UserCtx {
  username: string;
}

export const handler: Handlers = {
  GET(_req, ctx) {
    const username = (ctx.state.user as UserCtx).username ?? ""; // propietario de los proyectos
    return ctx.render({ username });
  },
};

function Page({ data }: PageProps<UserCtx>) {
  const projectType = signal<string>("VM");
  const username = data?.username || "";

  return (
    <div>
      <main className="container mt-5">
        <h1 className="mb-2">
          Proyectos almacenados
        </h1>
        <p className="lead">
          Puede acceder a los distintos proyectos pulsando en su icono.
        </p>
        <div className="text-center">
          <ProjectSelectButtons projectType={projectType} />
          <div className="row justify-content-center mt-2">
            <ProjectManagement projectType={projectType} username={username} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;
