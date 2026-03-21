"use client";
import { useState, useEffect, useRef } from "react";
import { signOutAction } from "@/app/actions";

const T = {
  en: {
    submit: "Submit",
    library: "My Library",
    teams: "Teams",
    admin: "Admin",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    language: "Language",
    signOut: "Sign out",
    signIn: "Sign in",
  },
  es: {
    submit: "Publicar",
    library: "Mi Biblioteca",
    teams: "Equipos",
    admin: "Admin",
    theme: "Tema",
    dark: "Oscuro",
    light: "Claro",
    language: "Idioma",
    signOut: "Cerrar sesión",
    signIn: "Iniciar sesión",
  },
} as const;

type Lang = keyof typeof T;

interface Props {
  user: {
    name?: string | null;
    image?: string | null;
    githubLogin?: string;
    role?: string;
  } | null;
}

export function NavProfile({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState<Lang>("en");
  const ref = useRef<HTMLDivElement>(null);

  const t = T[lang];

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "dark" | "light") ?? "dark";
    const savedLang = (localStorage.getItem("lang") as Lang) ?? "en";
    setTheme(savedTheme);
    setLang(savedLang);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function applyTheme(next: "dark" | "light") {
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(next);
    setTheme(next);
    localStorage.setItem("theme", next);
  }

  function applyLang(next: Lang) {
    setLang(next);
    localStorage.setItem("lang", next);
  }

  if (!user) {
    return (
      <a
        href="/auth/signin"
        className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors text-gray-300 text-sm"
      >
        {t.signIn}
      </a>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-gray-700 transition-all p-0.5"
        aria-label="Profile menu"
      >
        {user.image
          ? <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
          : <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300">{user.githubLogin?.[0]?.toUpperCase()}</div>
        }
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* User header */}
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-sm font-medium text-white truncate">{user.name ?? user.githubLogin}</p>
            <p className="text-xs text-gray-500">@{user.githubLogin}</p>
          </div>

          {/* Nav items */}
          <div className="py-1">
            <Item href="/submit" icon="✦" onClick={() => setOpen(false)}>{t.submit}</Item>
            <Item href="/library" icon="◫" onClick={() => setOpen(false)}>{t.library}</Item>
            <Item href="/teams" icon="◈" onClick={() => setOpen(false)}>{t.teams}</Item>
            {user.role === "admin" && (
              <Item href="/admin" icon="⚙" onClick={() => setOpen(false)} yellow>{t.admin}</Item>
            )}
          </div>

          {/* Settings */}
          <div className="border-t border-gray-800 py-1">
            {/* Theme */}
            <button
              onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-base">{theme === "dark" ? "🌙" : "☀️"}</span>
                {t.theme}
              </span>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                {theme === "dark" ? t.dark : t.light}
              </span>
            </button>

            {/* Language */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="flex items-center gap-2.5 text-sm text-gray-300">
                <span className="text-base">🌐</span>
                {t.language}
              </span>
              <div className="flex gap-1">
                {(["en", "es"] as Lang[]).map(l => (
                  <button
                    key={l}
                    onClick={() => applyLang(l)}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                      lang === l
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-gray-500 hover:text-gray-300 border border-transparent"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-800 py-1">
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
              >
                <span>↩</span> {t.signOut}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({
  href, icon, children, onClick, yellow,
}: {
  href: string; icon: string; children: React.ReactNode; onClick?: () => void; yellow?: boolean;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
        yellow ? "text-yellow-400 hover:text-yellow-300" : "text-gray-300 hover:text-white"
      }`}
    >
      <span className="text-gray-500 text-xs w-3">{icon}</span>
      {children}
    </a>
  );
}
