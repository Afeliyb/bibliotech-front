import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftRight, RotateCcw, Plus, X, Search } from "lucide-react";
import { getBorrowings, returnBook, createBorrowing, getUsers, getBooks } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  active:   { label: "En cours",  variant: "default",     color: "text-primary" },
  overdue:  { label: "En retard", variant: "destructive", color: "text-destructive" },
  returned: { label: "Retourné",  variant: "secondary",   color: "text-muted-foreground" },
};

export default function Borrowings() {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [maxLoanDays, setMaxLoanDays] = useState(14);

  // Formulaire admin
  const [selectedUserId, setSelectedUserId] = useState("");
  const [bookIdInput, setBookIdInput] = useState("");
  const [foundBook, setFoundBook] = useState<any | null>(null);
  const [bookSearchTimeout, setBookSearchTimeout] = useState<any>(null);
  const [loanDays, setLoanDays] = useState(14);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all"); // all | active | overdue | returned

  const load = async () => {
    setLoading(true);
    try {
      const [bs, us, bks, settings] = await Promise.all([
        getBorrowings(), getUsers(), getBooks(),
        fetch(`${BASE}/admin/settings`).then(r => r.json()).catch(() => ({}))
      ]);
      setBorrowings(bs || []);
      setUsers(us || []);
      setAllBooks(bks || []);
      const days = parseInt(settings?.loan_duration_days || "14");
      setMaxLoanDays(isNaN(days) ? 14 : days);
      setLoanDays(isNaN(days) ? 14 : days);
    } catch { setBorrowings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Lookup livre par ID en temps réel
  useEffect(() => {
    if (bookSearchTimeout) clearTimeout(bookSearchTimeout);
    if (!bookIdInput.trim()) { setFoundBook(null); return; }
    const id = parseInt(bookIdInput);
    if (isNaN(id)) { setFoundBook(null); return; }
    const t = setTimeout(() => {
      const book = allBooks.find((b: any) => b.id === id);
      setFoundBook(book || null);
    }, 300);
    setBookSearchTimeout(t);
  }, [bookIdInput, allBooks]);

  const handleReturn = async (id: number) => {
    try {
      await returnBook(id);
      toast({ title: "Retour enregistré ✓" });
      load();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const handleCreate = async () => {
    if (!selectedUserId || !bookIdInput || !foundBook) {
      toast({ title: "Champs incomplets", description: "Sélectionnez un membre et un livre valide.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const today = new Date();
      const due = new Date();
      due.setDate(today.getDate() + loanDays);
      await createBorrowing({
        user_id: Number(selectedUserId),
        book_id: foundBook.id,
        borrowed_at: today.toISOString(),
        due_date: due.toISOString().split("T")[0],
      });
      toast({ title: "Emprunt créé ✓", description: `« ${foundBook.title} » emprunté par ${users.find(u => u.id === Number(selectedUserId))?.name} — retour le ${due.toLocaleDateString("fr-FR")}` });
      setShowForm(false);
      setSelectedUserId(""); setBookIdInput(""); setFoundBook(null);
      load();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const currentUserId = users.find((u) => u.email === user?.email)?.id;
  const isAdmin = user?.role === "admin";

  let displayed = isAdmin ? borrowings : borrowings.filter(b => b.user_id === currentUserId);
  if (filter !== "all") displayed = displayed.filter(b => (b.status || "active") === filter);

  const counts = {
    all: (isAdmin ? borrowings : borrowings.filter(b => b.user_id === currentUserId)).length,
    active: (isAdmin ? borrowings : borrowings.filter(b => b.user_id === currentUserId)).filter(b => b.status === "active").length,
    overdue: (isAdmin ? borrowings : borrowings.filter(b => b.user_id === currentUserId)).filter(b => b.status === "overdue").length,
    returned: (isAdmin ? borrowings : borrowings.filter(b => b.user_id === currentUserId)).filter(b => b.status === "returned").length,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">
              {isAdmin ? "Emprunts" : "Mes emprunts"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "Chargement..." : `${counts.all} emprunt(s) — ${counts.active} actif(s), ${counts.overdue} en retard`}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Nouvel emprunt
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all",      label: `Tous (${counts.all})` },
          { key: "active",   label: `En cours (${counts.active})` },
          { key: "overdue",  label: `En retard (${counts.overdue})` },
          { key: "returned", label: `Retournés (${counts.returned})` },
        ].map(f => (
          <Badge key={f.key} variant={filter === f.key ? "default" : "outline"}
            className="cursor-pointer transition-all" onClick={() => setFilter(f.key)}>
            {f.label}
          </Badge>
        ))}
      </div>

      {/* ── Modal Nouvel emprunt ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-card border border-border/50 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">Créer un emprunt</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                {/* Membre */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Adhérent</label>
                  <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">— Choisir un membre —</option>
                    {users.filter(u => u.role === "member").map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>

                {/* Livre par ID */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">ID du livre</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Entrez l'ID du livre..." value={bookIdInput}
                      onChange={e => setBookIdInput(e.target.value)} className="pl-9" />
                  </div>
                  {/* Aperçu du livre trouvé */}
                  {bookIdInput && (
                    <div className={`mt-2 p-2.5 rounded-lg text-sm flex items-center gap-3 border ${foundBook ? "bg-primary/10 border-primary/30 text-primary" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
                      {foundBook ? (
                        <>
                          {foundBook.cover && <img src={foundBook.cover} alt="" className="h-10 w-7 object-cover rounded shrink-0" />}
                          <div>
                            <p className="font-semibold text-sm">{foundBook.title}</p>
                            <p className="text-xs opacity-80">{foundBook.author} — {foundBook.available_copies}/{foundBook.total_copies} disponible(s)</p>
                          </div>
                        </>
                      ) : (
                        <p>Aucun livre trouvé avec l'ID {bookIdInput}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Durée */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Durée d'emprunt</label>
                    <span className="text-primary font-bold">{loanDays} jour(s)</span>
                  </div>
                  <input type="range" min={1} max={maxLoanDays} value={loanDays}
                    onChange={e => setLoanDays(parseInt(e.target.value))}
                    className="w-full accent-primary" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Retour prévu : {new Date(Date.now() + loanDays * 86400000).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Annuler</Button>
                  <Button className="flex-1" onClick={handleCreate} disabled={submitting || !foundBook || !selectedUserId}>
                    {submitting ? "Création..." : "Créer l'emprunt"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste */}
      <div className="space-y-3">
        {loading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />)}
          </div>
        )}
        {!loading && displayed.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun emprunt trouvé</p>
          </div>
        )}
        {displayed.map((b, i) => {
          const cfg = statusConfig[b.status || "active"];
          return (
            <motion.div key={b.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}>
              <Card className={`border-border/50 hover:border-primary/20 transition-colors ${b.status === "overdue" ? "border-destructive/20" : ""}`}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${b.status === "overdue" ? "bg-destructive/10" : "bg-primary/10"}`}>
                      <ArrowLeftRight className={`h-4 w-4 ${b.status === "overdue" ? "text-destructive" : "text-primary"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{b.book_title}</p>
                      <p className="text-xs text-muted-foreground">{b.book_author}</p>
                      {isAdmin && (
                        <p className="text-xs text-primary mt-0.5 truncate">👤 {b.user_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 text-xs text-muted-foreground shrink-0">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider">Emprunté</p>
                      <p className="font-medium text-foreground">{b.borrowed_at?.split("T")[0]}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider">Échéance</p>
                      <p className={`font-medium ${b.status === "overdue" ? "text-destructive" : "text-foreground"}`}>
                        {b.due_date || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    {b.status !== "returned" && isAdmin && (
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleReturn(b.id)}>
                        <RotateCcw className="h-3 w-3 mr-1" />Retourner
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
