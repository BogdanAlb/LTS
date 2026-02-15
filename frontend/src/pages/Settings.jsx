import { useEffect, useMemo, useState } from "react";
import { addUser, getUsers, removeUser } from "../api/users";
import { useLanguage } from "../i18n/useLanguage";

const routes = [
  { path: "/", descriptionKey: "settings.routeDescriptions.home" },
  { path: "/dashboard", descriptionKey: "settings.routeDescriptions.dashboard" },
  { path: "/grafic", descriptionKey: "settings.routeDescriptions.graph" },
  { path: "/status", descriptionKey: "settings.routeDescriptions.status" },
  { path: "/settings", descriptionKey: "settings.routeDescriptions.settings" },
];

const ACTIVE_USER_STORAGE_KEY = "lts_active_user_id";
const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

export default function Settings() {
  const { language, setLanguage, supportedLanguages, theme, setTheme, supportedThemes, t } =
    useLanguage();
  const [users, setUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState("restricted");
  const [usersLoading, setUsersLoading] = useState(true);
  const [userFeedback, setUserFeedback] = useState("");

  const activeUser = useMemo(
    () => users.find((user) => user.id === activeUserId) ?? null,
    [users, activeUserId],
  );
  const canManageUsers = activeUser?.role === "admin";

  useEffect(() => {
    if (!activeUserId) {
      window.localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(ACTIVE_USER_STORAGE_KEY, String(activeUserId));
  }, [activeUserId]);

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      try {
        const list = await getUsers();
        if (!mounted) {
          return;
        }
        setUsers(list);

        const savedUserId = Number(window.localStorage.getItem(ACTIVE_USER_STORAGE_KEY));
        const hasSavedUser = list.some((user) => user.id === savedUserId);
        const defaultAdmin = list.find((user) => user.role === "admin");
        const fallbackUser = defaultAdmin ?? list[0] ?? null;
        const resolvedActiveId = hasSavedUser ? savedUserId : fallbackUser?.id ?? null;
        setActiveUserId(resolvedActiveId);
      } catch (error) {
        if (mounted) {
          setUserFeedback(error.message ?? t("settings.users.messages.loadError"));
        }
      } finally {
        if (mounted) {
          setUsersLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [t]);

  const handleAddUser = async (event) => {
    event.preventDefault();
    if (!canManageUsers || !activeUserId) {
      setUserFeedback(t("settings.users.messages.noRights"));
      return;
    }

    const normalizedUsername = newUsername.trim();
    const validLength = normalizedUsername.length >= 3 && normalizedUsername.length <= 32;
    if (!validLength || !USERNAME_PATTERN.test(normalizedUsername)) {
      setUserFeedback(t("settings.users.messages.invalidName"));
      return;
    }

    try {
      const created = await addUser({
        username: normalizedUsername,
        role: newRole,
        actorId: activeUserId,
      });
      setUsers((prev) =>
        [...prev, created].sort((left, right) => {
          if (left.role !== right.role) {
            return left.role === "admin" ? -1 : 1;
          }
          return left.username.localeCompare(right.username, undefined, { sensitivity: "base" });
        }),
      );
      setNewUsername("");
      setNewRole("restricted");
      setUserFeedback(t("settings.users.messages.created"));
    } catch (error) {
      setUserFeedback(error.message ?? t("settings.users.messages.createError"));
    }
  };

  const handleDeleteUser = async (user) => {
    if (!canManageUsers || !activeUserId) {
      setUserFeedback(t("settings.users.messages.noRights"));
      return;
    }

    const confirmDelete = window.confirm(`${t("settings.users.messages.confirmDelete")} "${user.username}"?`);
    if (!confirmDelete) {
      return;
    }

    try {
      await removeUser({ userId: user.id, actorId: activeUserId });
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setUserFeedback(t("settings.users.messages.deleted"));
    } catch (error) {
      setUserFeedback(error.message ?? t("settings.users.messages.deleteError"));
    }
  };

  return (
    <section className="page">
      <h2 className="page-title">{t("settings.title")}</h2>
      <p className="page-subtitle">
        {t("settings.subtitle")} <code>VITE_API_BASE_URL</code>.
      </p>

      <div className="info-card">
        <p className="info-label">{t("settings.language")}</p>
        <div className="language-buttons">
          {supportedLanguages.map((code) => (
            <button
              key={code}
              type="button"
              className={`language-button${language === code ? " active" : ""}`}
              onClick={() => setLanguage(code)}
            >
              {t(`settings.languageNames.${code}`)}
            </button>
          ))}
        </div>
        <p className="info-note">
          {t("settings.selectedLanguage")}: {t(`settings.languageNames.${language}`)}
        </p>
      </div>

      <div className="info-card">
        <p className="info-label">{t("settings.appearance")}</p>
        <div className="theme-buttons">
          {supportedThemes.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`theme-button${theme === mode ? " active" : ""}`}
              onClick={() => setTheme(mode)}
            >
              {t(`settings.themeNames.${mode}`)}
            </button>
          ))}
        </div>
        <p className="info-note">
          {t("settings.selectedTheme")}: {t(`settings.themeNames.${theme}`)}
        </p>
      </div>

      <div className="info-card">
        <p className="info-label">{t("settings.users.title")}</p>
        <p className="info-note">{t("settings.users.subtitle")}</p>

        {usersLoading ? (
          <p className="info-note">{t("settings.users.loading")}</p>
        ) : (
          <>
            <div className="user-switch">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`user-chip${user.id === activeUserId ? " active" : ""}`}
                  onClick={() => setActiveUserId(user.id)}
                >
                  {user.username}
                </button>
              ))}
            </div>

            <p className="info-note">
              {t("settings.users.activeUser")}:{" "}
              {activeUser
                ? `${activeUser.username} (${t(`settings.userRoles.${activeUser.role}`)})`
                : t("settings.users.none")}
            </p>

            {!canManageUsers && activeUser ? (
              <p className="user-permission-note">{t("settings.users.messages.noRights")}</p>
            ) : null}

            {canManageUsers ? (
              <form className="user-form" onSubmit={handleAddUser}>
                <input
                  type="text"
                  className="user-input"
                  value={newUsername}
                  onChange={(event) => setNewUsername(event.target.value)}
                  placeholder={t("settings.users.usernamePlaceholder")}
                  aria-label={t("settings.users.usernameLabel")}
                />
                <select
                  className="user-select"
                  value={newRole}
                  onChange={(event) => setNewRole(event.target.value)}
                  aria-label={t("settings.users.roleLabel")}
                >
                  <option value="restricted">{t("settings.userRoles.restricted")}</option>
                  <option value="admin">{t("settings.userRoles.admin")}</option>
                </select>
                <button type="submit" className="user-action-button">
                  {t("settings.users.actions.add")}
                </button>
              </form>
            ) : null}

            <ul className="user-list">
              {users.map((user) => (
                <li key={user.id} className="user-row">
                  <div className="user-main">
                    <span className="user-name">{user.username}</span>
                    <span className={`role-badge ${user.role}`}>
                      {t(`settings.userRoles.${user.role}`)}
                    </span>
                  </div>
                  {canManageUsers ? (
                    <button
                      type="button"
                      className="user-delete"
                      onClick={() => handleDeleteUser(user)}
                      disabled={user.id === activeUserId}
                    >
                      {t("settings.users.actions.delete")}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        )}

        {userFeedback ? <p className="user-message">{userFeedback}</p> : null}
      </div>

      <div className="info-card">
        <p className="info-label">{t("settings.routes")}</p>
        <ul className="route-list">
          {routes.map((route) => (
            <li key={route.path}>
              <code>{route.path}</code> - {t(route.descriptionKey)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
