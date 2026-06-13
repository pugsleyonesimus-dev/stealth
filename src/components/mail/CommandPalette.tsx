import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Inbox,
  Mail,
  Pencil,
  Search,
  Send,
  Settings,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { Email, MailFolder } from "./data";

type CommandItem = {
  icon: LucideIcon;
  label: string;
  hint: string;
  action: "compose" | "inbox" | "starred" | "sent" | "archive" | "settings";
};

const items: CommandItem[] = [
  { icon: Pencil, label: "Compose new email", hint: "⌘N", action: "compose" },
  { icon: Inbox, label: "Go to Inbox", hint: "G I", action: "inbox" },
  { icon: Star, label: "Go to Starred", hint: "G S", action: "starred" },
  { icon: Send, label: "Go to Sent", hint: "G T", action: "sent" },
  { icon: Archive, label: "Archive thread", hint: "E", action: "archive" },
  { icon: Settings, label: "Open settings", hint: ",", action: "settings" },
];

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  onCompose?: () => void;
  onNavigate?: (folder: MailFolder) => void;
  onArchive?: () => void;
  onOpenSettings?: () => void;
  emails?: Email[];
  onSelectEmail?: (email: Email) => void;
};

export function CommandPalette({
  open,
  onClose,
  onCompose,
  onNavigate,
  onArchive,
  onOpenSettings,
  emails = [],
  onSelectEmail,
}: CommandPaletteProps) {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const filtered = items.filter((item) => item.label.toLowerCase().includes(q.toLowerCase()));
  const messageResults = q.trim()
    ? emails
        .filter((email) =>
          [email.from, email.email, email.subject, email.preview, ...(email.labels ?? [])]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase()),
        )
        .slice(0, 6)
    : [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="glass-strong fixed left-1/2 top-24 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none"
              />
              <kbd className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {messageResults.length > 0 && (
                <li className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Messages
                </li>
              )}
              {messageResults.map((email) => (
                <li key={email.id}>
                  <button
                    onClick={() => {
                      onSelectEmail?.(email);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground/90">
                        {email.subject}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {email.from}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length > 0 && (
                <li className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Commands
                </li>
              )}
              {filtered.map((it) => (
                <li key={it.label}>
                  <button 
                    onClick={() => {
                      onClose();
                      switch (it.action) {
                        case "compose":
                          onCompose?.();
                          break;
                        case "inbox":
                        case "starred":
                        case "sent":
                          onNavigate?.(it.action);
                          break;
                        case "archive":
                          onArchive?.();
                          break;
                        case "settings":
                          onOpenSettings?.();
                          break;
                      }
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/90 transition hover:bg-white/[0.06]"
                  >
                    <it.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{it.label}</span>
                    <span className="ml-auto rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {it.hint}
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-xs text-muted-foreground">No matches</li>
              )}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
