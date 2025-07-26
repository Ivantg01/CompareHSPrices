import Badge from "../islands/Badge.tsx";
import { FunctionComponent } from "preact";

interface HeaderProps {
  username: string;
  isAdmin: boolean;
}

const Header: FunctionComponent<HeaderProps> = ({ username, isAdmin }) => {
  return (
    <header className="navbar navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand" href="/menu">
          Comparador de precios de Hiperescaladores
        </a>

        <nav>
          <ul className="navbar-nav d-flex flex-row">
            <li className="nav-item me-3">
              <Badge username={username} />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
