import Home from "../components/Home.tsx";
import { FreshContext, PageProps } from "$fresh/server.ts";
import { usernameSignal } from "../utils/signals.ts";

export async function handler(req: Request, ctx: FreshContext) {
  const username = usernameSignal.value ?? "";
  return ctx.render({ username });
}

type Data = {
  username?: string;
};

export default function Menu(props: PageProps<Data>) {
  return (
    <div>
      <Home username={props.data?.username} />
    </div>
  );
}
