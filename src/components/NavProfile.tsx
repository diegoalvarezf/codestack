"use client";
import { useState, useEffect, useRef } from "react";
import {
  Upload, BookOpen, Users, Settings2, Moon, Sun,
  Globe, LogOut, LogIn, ChevronDown, Shield,
} from "lucide-react";
import { signOutAction } from "@/app/actions";
import { getT, type Lang } from "@/lib/i18n";

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

  const t = getT(lang);

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
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(next);
    setTheme(next);
    localStorage.setItem("theme", next);
    document.cookie = `theme=${next};path=/;max-age=31536000`;
  }

  function applyLang(next: Lang) {
    setLang(next);
    localStorage.setItem("lang", next);
    document.cookie = `lang=${next};path=/;max-age=31536000`;
    // Reload so server components pick up the new language
    window.location.reload();
  }

  if (!user) {
    return (
      <a
        href="/auth/signin"
        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors text-gray-300 text-sm"
      >
        <LogIn size={14} />
        {t.signIn}
      </a>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        aria-label="Profile menu"
      >
        {user.image
          ? <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
          : <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300">{user.githubLogin?.[0]?.toUpperCase()}</div>
        }
        <ChevronDown size={12} className="text-gray-500" />
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
            <DropItem href="/submit" icon={<Upload size={14} />} onClick={() => setOpen(false)}>{t.submit}</DropItem>
            <DropItem href="/library" icon={<BookOpen size={14} />} onClick={() => setOpen(false)}>{t.library}</DropItem>
            <DropItem href="/teams" icon={<Users size={14} />} onClick={() => setOpen(false)}>{t.teams}</DropItem>
            {user.role === "admin" && (
              <DropItem href="/admin" icon={<Shield size={14} />} onClick={() => setOpen(false)} yellow>{t.admin}</DropItem>
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
                {theme === "dark" ? <Moon size={14} className="text-gray-400" /> : <Sun size={14} className="text-gray-400" />}
                {t.theme}
              </span>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                {theme === "dark" ? t.dark : t.light}
              </span>
            </button>

            {/* Language */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="flex items-center gap-2.5 text-sm text-gray-300">
                <Globe size={14} className="text-gray-400" />
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
                <LogOut size={14} />
                {t.signOut}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DropItem({
  href, icon, children, onClick, yellow,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  yellow?: boolean;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
        yellow ? "text-yellow-400 hover:text-yellow-300" : "text-gray-300 hover:text-white"
      }`}
    >
      <span className={yellow ? "text-yellow-500" : "text-gray-500"}>{icon}</span>
      {children}
    </a>
  );
}
