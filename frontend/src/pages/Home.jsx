import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ACTIVE_USER_STORAGE_KEY } from "../auth/constants";
import { useSession } from "../auth/useSession";
import { getUsers } from "../api/users";
import { useLanguage } from "../i18n/useLanguage";

const PIN_LENGTH = 4;
const KEYPAD_ITEMS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "enter"];
const PIN_DOTS = Array.from({ length: PIN_LENGTH }, (_, index) => index);

function getUserInitials(username) {
  const parts = username
    .split(/[\s._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated, login, settingsSyncError } = useSession();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(() => {
    const savedValue = Number(window.localStorage.getItem(ACTIVE_USER_STORAGE_KEY));
    return Number.isFinite(savedValue) && savedValue > 0 ? savedValue : null;
  });
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branches = [
    {
      title: t("home.branches.dashboard.title"),
      description: t("home.branches.dashboard.description"),
      to: "/dashboard",
    },
    {
      title: t("home.branches.graph.title"),
      description: t("home.branches.graph.description"),
      to: "/grafic",
    },
    {
      title: t("home.branches.status.title"),
      description: t("home.branches.status.description"),
      to: "/status",
    },
    {
      title: t("home.branches.settings.title"),
      description: t("home.branches.settings.description"),
      to: "/settings",
    },
  ];

  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      try {
        const list = await getUsers();
        if (!mounted) {
          return;
        }
        setUsers(list);
        setSelectedUserId((current) => {
          if (list.some((user) => user.id === current)) {
            return current;
          }
          const savedValue = Number(window.localStorage.getItem(ACTIVE_USER_STORAGE_KEY));
          if (list.some((user) => user.id === savedValue)) {
            return savedValue;
          }
          return list[0]?.id ?? null;
        });
      } catch (error) {
        if (mounted) {
          setFeedback(error.message ?? t("home.login.messages.loadError"));
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

  const selectedUser = useMemo(
    () => users.find((item) => item.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );
  const canSubmit = Boolean(selectedUser) && pin.length === PIN_LENGTH && !isSubmitting;

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setPin("");
    setFeedback("");
  };

  const handleDigit = (value) => {
    if (!selectedUser || isSubmitting) {
      return;
    }
    setFeedback("");
    setPin((current) => (current.length < PIN_LENGTH ? `${current}${value}` : current));
  };

  const handleClear = () => {
    if (isSubmitting) {
      return;
    }
    setPin("");
    setFeedback("");
  };

  const handleEnter = async () => {
    if (!selectedUser) {
      setFeedback(t("home.login.messages.chooseUser"));
      return;
    }
    if (pin.length !== PIN_LENGTH) {
      setFeedback(t("home.login.messages.pinLength"));
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    try {
      await login({ userId: selectedUser.id, pin });
      setPin("");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setPin("");
      setFeedback(error.message ?? t("home.login.messages.invalidLogin"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeypadAction = (item) => {
    if (item === "clear") {
      handleClear();
      return;
    }
    if (item === "enter") {
      handleEnter();
      return;
    }
    handleDigit(item);
  };

  if (!isAuthenticated) {
    return (
      <section className="page login-page">
        <h2 className="page-title">{t("home.login.title")}</h2>
        <p className="page-subtitle">{t("home.login.subtitle")}</p>

        {usersLoading ? <p className="info-note">{t("home.login.loadingUsers")}</p> : null}

        {!usersLoading && users.length > 0 ? (
          <>
            <div className="login-user-grid">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`login-user-card${user.id === selectedUserId ? " active" : ""}`}
                  onClick={() => handleSelectUser(user.id)}
                >
                  <span className="login-user-initials">{getUserInitials(user.username)}</span>
                  <span className="login-user-name">{user.username}</span>
                </button>
              ))}
            </div>

            <div className="pin-panel">
              <p className="info-note">
                {selectedUser
                  ? `${t("home.login.selectedUser")}: ${selectedUser.username}`
                  : t("home.login.messages.chooseUser")}
              </p>
              <p className="pin-title">{t("home.login.enterPin")}</p>

              <div className="pin-dots" aria-label={t("home.login.pinAria")}>
                {PIN_DOTS.map((index) => (
                  <span
                    key={`pin-dot-${index}`}
                    className={`pin-dot${index < pin.length ? " filled" : ""}`}
                  />
                ))}
              </div>

              <div className="pin-keypad" aria-label={t("home.login.keypadAria")}>
                {KEYPAD_ITEMS.map((item) => {
                  const isControl = item === "clear" || item === "enter";
                  const label =
                    item === "clear"
                      ? t("home.login.actions.clear")
                      : item === "enter"
                        ? t("home.login.actions.enter")
                        : item;
                  const isDigit = !isControl;

                  return (
                    <button
                      key={item}
                      type="button"
                      className={`pin-key${isControl ? " control" : ""}${item === "enter" ? " enter" : ""}`}
                      onClick={() => handleKeypadAction(item)}
                      disabled={
                        isSubmitting ||
                        !selectedUser ||
                        (item === "enter" && !canSubmit) ||
                        (isDigit && pin.length >= PIN_LENGTH)
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        {!usersLoading && users.length === 0 ? (
          <p className="user-message">{t("home.login.messages.noUsers")}</p>
        ) : null}
        {feedback ? <p className="user-message">{feedback}</p> : null}
      </section>
    );
  }

  return (
    <section className="page">
      <h2 className="page-title">{t("home.title")}</h2>
      {settingsSyncError ? <p className="user-message">{settingsSyncError}</p> : null}
      <div className="feature-grid">
        {branches.map((branch) => (
          <Link key={branch.to} to={branch.to} className="feature-card">
            <h3>{branch.title}</h3>
            <p>{branch.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
