import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, BookCopy, X, Upload, Image, Star, BookOpen, Hash, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/BookCard";
import {
  getBooks, getUsers, createBorrowing, createReservation,
  createBook, addBookCopies,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const genres = ["Tous", "Roman", "Conte", "Poésie", "Histoire", "Philosophie", "Science", "Art", "Autre"];
const defaultForm = { title: "", author: "", isbn: "", published_year: "", genre: "", rating: "", total_copies: "1", cover: "", description: "" };

export default function Books() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("Tous");
  const [books, setBooks] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [maxLoanDays, setMaxLoanDays] = useState(14);

  // Modals
  const [selectedBook, setSelectedBook] = useState<any | null>(null); // détail
  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddCopies, setShowAddCopies] = useState<any | null>(null);
  const [addCopiesCount, setAddCopiesCount] = useState(1);

  // Emprunt modal
  const [borrowBook, setBorrowBook] = useState<any | null>(null);
  const [borrowDays, setBorrowDays] = useState(14);

  // Formulaire ajout livre
  const [form, setForm] = useState(defaultForm);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "admin";

  const loadBooks = async () => {
    const data = await getBooks().catch(() => []);
    setBooks(data || []);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getBooks(),
      getUsers(),
      fetch(`${BASE}/admin/settings`).then(r => r.json()).catch(() => ({})),
    ]).then(([booksData, usersData, settings]) => {
      if (!mounted) return;
      setBooks(booksData || []);
      const days = parseInt(settings?.loan_duration_days || "14");
      setMaxLoanDays(isNaN(days) ? 14 : days);
      setBorrowDays(isNaN(days) ? 14 : days);
      if (user?.email) {
        const me = (usersData || []).find((u: any) => u.email === user.email);
        setCurrentUserId(me?.id ?? null);
      }
    }).catch(() => { if (!mounted) return; setBooks([]); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [user]);

  const handleBorrowConfirm = async () => {
    if (!currentUserId || !borrowBook) return;
    try {
      const today = new Date();
      const due = new Date();
      due.setDate(today.getDate() + borrowDays);
      await createBorrowing({
        user_id: currentUserId,
        book_id: borrowBook.id,
        borrowed_at: today.toISOString(),
        due_date: due.toISOString().split("T")[0],
      });
      toast({ title: "Emprunt créé ✓", description: `« ${borrowBook.title} » emprunté pour ${borrowDays} jour(s). Retour avant le ${due.toLocaleDateString("fr-FR")}.` });
      setBorrowBook(null);
      setSelectedBook(null);
      loadBooks();
    } catch (e: any) {
      toast({ title: "Impossible d'emprunter", description: e.message, variant: "destructive" });
    }
  };

  const handleBorrowClick = (book: any) => {
    if (!user) { toast({ title: "Connectez-vous" }); return; }
    if (!currentUserId) { toast({ title: "Erreur", description: "Reconnectez-vous." }); return; }
    setBorrowDays(maxLoanDays);
    setBorrowBook(book);
  };

  const handleReserve = async (book: any) => {
    if (!currentUserId) { toast({ title: "Erreur", description: "Reconnectez-vous." }); return; }
    try {
      await createReservation({ user_id: currentUserId, book_id: book.id });
      toast({ title: "Réservation créée ✓", description: `Vous serez notifié quand « ${book.title} » sera disponible.` });
      setSelectedBook(null);
    } catch {
      toast({ title: "Échec", description: "Impossible de réserver.", variant: "destructive" });
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setForm((f) => ({ ...f, cover: b64 }));
      setCoverPreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleAddBook = async () => {
    if (!form.title.trim()) { toast({ title: "Titre requis", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await createBook({
        title: form.title, author: form.author || null, isbn: form.isbn || null,
        published_year: form.published_year ? parseInt(form.published_year) : null,
        genre: form.genre || null, rating: form.rating ? parseFloat(form.rating) : null,
        total_copies: parseInt(form.total_copies) || 1,
        cover: form.cover || null, description: form.description || null,
      });
      toast({ title: "Livre ajouté ✓", description: `« ${form.title} » ajouté au catalogue.` });
      setForm(defaultForm); setCoverPreview(null); setShowAddBook(false);
      loadBooks();
    } catch { toast({ title: "Erreur", description: "Impossible d'ajouter.", variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const handleAddCopies = async () => {
    if (!showAddCopies) return;
    try {
      await addBookCopies(showAddCopies.id, addCopiesCount);
      toast({ title: "Exemplaires ajoutés ✓", description: `+${addCopiesCount} exemplaire(s) pour « ${showAddCopies.title} »` });
      setShowAddCopies(null); loadBooks();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    return (
      ((b.title || "").toLowerCase().includes(q) || (b.author || "").toLowerCase().includes(q)) &&
      (activeGenre === "Tous" || b.genre === activeGenre)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Catalogue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Chargement..." : `${books.length} livre${books.length !== 1 ? "s" : ""} dans la collection`}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddBook(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter un livre
          </Button>
        )}
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un livre ou un auteur..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border/50" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {genres.map((g) => (
          <Badge key={g} variant={activeGenre === g ? "default" : "outline"}
            className="cursor-pointer transition-all" onClick={() => setActiveGenre(g)}>{g}</Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((book) => (
          <div key={book.id} className="relative group/wrap">
            <BookCard {...book}
              onBorrow={() => handleBorrowClick(book)}
              onReserve={() => handleReserve(book)}
              onClick={() => setSelectedBook(book)}
            />
            {isAdmin && (
              <button onClick={() => { setShowAddCopies(book); setAddCopiesCount(1); }}
                className="absolute top-2 left-2 opacity-0 group-hover/wrap:opacity-100 transition-opacity bg-card/90 border border-border/50 rounded-md p-1 hover:border-primary/50"
                title="Ajouter des exemplaires">
                <BookCopy className="h-3 w-3 text-primary" />
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Aucun livre trouvé</p>
        </div>
      )}

      {/* ── Modal Détail Livre ── */}
      <AnimatePresence>
        {selectedBook && !borrowBook && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setSelectedBook(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-card border border-border/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between p-5 border-b border-border/50">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Hash className="h-3 w-3" />ID {selectedBook.id}
                    </span>
                    {selectedBook.genre && (
                      <span className="text-[10px] text-primary uppercase tracking-wider font-medium">{selectedBook.genre}</span>
                    )}
                  </div>
                  <h2 className="font-display font-bold text-lg leading-tight">{selectedBook.title}</h2>
                  {selectedBook.author && <p className="text-sm text-muted-foreground mt-0.5">{selectedBook.author}</p>}
                </div>
                <button onClick={() => setSelectedBook(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 flex gap-5">
                {/* Cover */}
                <div className="w-28 shrink-0">
                  {selectedBook.cover ? (
                    <img src={selectedBook.cover} alt={selectedBook.title}
                      className="w-full aspect-[2/3] object-cover rounded-lg border border-border/50 shadow-lg" />
                  ) : (
                    <div className="w-full aspect-[2/3] rounded-lg bg-secondary flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedBook.published_year && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{selectedBook.published_year}</span>
                      </div>
                    )}
                    {selectedBook.rating && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span>{selectedBook.rating.toFixed(1)}/5</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BookCopy className="h-3 w-3" />
                      <span>{selectedBook.available_copies}/{selectedBook.total_copies} disponible(s)</span>
                    </div>
                  </div>

                  {selectedBook.description && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Résumé</p>
                      <p className="text-sm leading-relaxed text-foreground/80">{selectedBook.description}</p>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    {selectedBook.available_copies > 0 ? (
                      <Button size="sm" className="flex-1" onClick={() => handleBorrowClick(selectedBook)}>
                        Emprunter
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleReserve(selectedBook)}>
                        Réserver
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setSelectedBook(null)}>Fermer</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Durée d'emprunt ── */}
      <AnimatePresence>
        {borrowBook && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setBorrowBook(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-card border border-border/50 rounded-2xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Durée d'emprunt</h2>
                <button onClick={() => setBorrowBook(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                « {borrowBook.title} » — choisissez combien de jours vous voulez l'emprunter (max {maxLoanDays} jours).
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Nombre de jours</label>
                  <span className="text-2xl font-bold text-primary">{borrowDays}</span>
                </div>
                <input type="range" min={1} max={maxLoanDays} value={borrowDays}
                  onChange={(e) => setBorrowDays(parseInt(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 jour</span><span>{maxLoanDays} jours max</span>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-xs text-primary">
                  📅 Retour prévu le{" "}
                  <strong>{new Date(Date.now() + borrowDays * 86400000).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</strong>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setBorrowBook(null)}>Annuler</Button>
                <Button className="flex-1" onClick={handleBorrowConfirm}>Confirmer</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Ajouter livre ── */}
      <AnimatePresence>
        {showAddBook && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowAddBook(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-border/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h2 className="text-lg font-bold">Ajouter un livre</h2>
                <button onClick={() => setShowAddBook(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1.5 block">Titre *</label>
                    <Input placeholder="Titre du livre" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Auteur</label>
                    <Input placeholder="Nom de l'auteur" value={form.author} onChange={(e) => setForm(f => ({ ...f, author: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">ISBN</label>
                    <Input placeholder="ISBN" value={form.isbn} onChange={(e) => setForm(f => ({ ...f, isbn: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Genre</label>
                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.genre} onChange={(e) => setForm(f => ({ ...f, genre: e.target.value }))}>
                      <option value="">— Choisir —</option>
                      {genres.filter(g => g !== "Tous").map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Année</label>
                    <Input type="number" placeholder="Ex: 2023" value={form.published_year} onChange={(e) => setForm(f => ({ ...f, published_year: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Note (0–5)</label>
                    <Input type="number" min="0" max="5" step="0.1" placeholder="4.5" value={form.rating} onChange={(e) => setForm(f => ({ ...f, rating: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Nombre d'exemplaires</label>
                    <Input type="number" min="1" value={form.total_copies} onChange={(e) => setForm(f => ({ ...f, total_copies: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1.5 block">Description / Résumé</label>
                    <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                      placeholder="Résumé du livre..." value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1.5 block">Photo de couverture</label>
                    <div className="flex items-start gap-4">
                      <div className="h-28 w-20 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden shrink-0"
                        onClick={() => fileRef.current?.click()}>
                        {coverPreview ? <img src={coverPreview} alt="" className="w-full h-full object-cover" /> : (
                          <div className="text-center text-muted-foreground p-2">
                            <Image className="h-6 w-6 mx-auto mb-1" /><span className="text-[10px]">Couverture</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()}>
                          <Upload className="h-3.5 w-3.5" />Uploader une image
                        </Button>
                        <p className="text-xs text-muted-foreground">ou</p>
                        <Input placeholder="URL de l'image (https://...)" className="text-xs"
                          onChange={(e) => { setForm(f => ({ ...f, cover: e.target.value })); setCoverPreview(e.target.value || null); }} />
                      </div>
                    </div>
                    <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleCoverFile} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowAddBook(false)}>Annuler</Button>
                  <Button onClick={handleAddBook} disabled={submitting}>
                    {submitting ? "Ajout..." : "Ajouter le livre"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Ajouter exemplaires ── */}
      <AnimatePresence>
        {showAddCopies && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowAddCopies(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-card border border-border/50 rounded-2xl w-full max-w-sm p-6">
              <h2 className="text-lg font-bold mb-1">Ajouter des exemplaires</h2>
              <p className="text-sm text-muted-foreground mb-6">
                « {showAddCopies.title} » — actuellement {showAddCopies.total_copies} exemplaire(s)
              </p>
              <Input type="number" min="1" value={addCopiesCount} onChange={(e) => setAddCopiesCount(Math.max(1, parseInt(e.target.value) || 1))} />
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowAddCopies(null)}>Annuler</Button>
                <Button onClick={handleAddCopies}><BookCopy className="h-4 w-4 mr-2" />Ajouter</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
