import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

function useSessionUser() {
  const [user, setUser] = useState(readStoredUser);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("token")) return;

    try {
      const res = await api.get("/auth/me");
      const currentUser = res.data?.user || {};

      localStorage.setItem("user", JSON.stringify(currentUser));
      setUser(currentUser);
    } catch {
      setUser(readStoredUser());
    }
  }, []);

  useEffect(() => {
    queueMicrotask(refreshUser);

    window.addEventListener("focus", refreshUser);

    return () => {
      window.removeEventListener("focus", refreshUser);
    };
  }, [refreshUser]);

  return user;
}

export default useSessionUser;
