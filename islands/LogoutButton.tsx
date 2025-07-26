import { isAdminSignal, usernameSignal } from "../utils/signals.ts";

export default function LogoutButton() {
  const handleLogout = () => {
    console.log("Logout activado {username.value}!");
    usernameSignal.value = "";
    isAdminSignal.value = false;
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.location.href = "/login";
  };

  return (
    <li
      className="className=dropdown-item"
      onClick={(e) => {
        e.preventDefault();
        handleLogout();
      }}
    >
      <a className="nav-link" href="/">Salir</a>
    </li>
  );
}
