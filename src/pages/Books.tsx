import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  obtenirLivres, creerLivre, modifierLivre, supprimerLivre,
  ajouterExemplaires, creerEmprunt, creerReservation,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  BookOpen, Plus, X, Search, Star, Pencil, Trash2,
  PlusCircle, Filter, BookCopy, BookMarked,
} from "lucide-react";

const GENRES = ["Tous","Roman","Conte","Philosophie","Science-Fiction","Dystopie","Histoire","Poésie","Biographie","Sciences"];

// ── Composant étoiles ─────────────────────────────────────────────────────────
function NotesEtoiles({ note }: { note: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= Math.round(note) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

// ── FormLivre en DEHORS du composant principal (évite perte focus) ────────────
interface FormState {
  titre: string; auteur: string; isbn: string; annee_publication: string;
  genre: string; note: string; total_exemplaires: string; couverture: string; description: string;
}

interface FormLivreProps {
  form: FormState;
  onChange: (key: keyof FormState, val: string) => void;
}

function FormLivre({ form, onChange }: FormLivreProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground mb-1.5 block">Titre *</label>
          <Input value={form.titre} onChange={e => onChange("titre", e.target.value)} placeholder="Titre du livre" className="bg-card border-border/60" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Auteur</label>
          <Input value={form.auteur} onChange={e => onChange("auteur", e.target.value)} placeholder="Auteur" className="bg-card border-border/60" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Genre</label>
          <select value={form.genre} onChange={e => onChange("genre", e.target.value)}
            className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
            <option value="">— Genre —</option>
            {GENRES.filter(g => g !== "Tous").map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">ISBN</label>
          <Input value={form.isbn} onChange={e => onChange("isbn", e.target.value)} placeholder="ISBN" className="bg-card border-border/60" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Année</label>
          <Input type="number" value={form.annee_publication} onChange={e => onChange("annee_publication", e.target.value)} placeholder="2024" className="bg-card border-border/60" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Note (/5)</label>
          <Input type="number" min={0} max={5} step={0.1} value={form.note} onChange={e => onChange("note", e.target.value)} placeholder="4.5" className="bg-card border-border/60" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Exemplaires</label>
          <Input type="number" min={1} value={form.total_exemplaires} onChange={e => onChange("total_exemplaires", e.target.value)} className="bg-card border-border/60" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground mb-1.5 block">URL Couverture</label>
          <Input value={form.couverture} onChange={e => onChange("couverture", e.target.value)} placeholder="https://..." className="bg-card border-border/60" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
          <textarea value={form.description} onChange={e => onChange("description", e.target.value)} rows={3}
            className="w-full px-3 py-2 rounded-xl bg-card border border-border/60 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Résumé..." />
        </div>
      </div>
    </div>
  );
}

const FORM_VIDE: FormState = { titre:"", auteur:"", isbn:"", annee_publication:"", genre:"", note:"", total_exemplaires:"1", couverture:"", description:"" };

// ── Page principale ───────────────────────────────────────────────────────────
export default function Livres() {
  const { utilisateur } = useAuth();
  const [livres, setLivres] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [genreFiltre, setGenreFiltre] = useState("Tous");
  const [disponibleSeulement, setDisponibleSeulement] = useState(false);

  const [modalAjout, setModalAjout] = useState(false);
  const [livreEdite, setLivreEdite] = useState<any>(null);
  const [livreDetail, setLivreDetail] = useState<any>(null);
  const [confirmSuppr, setConfirmSuppr] = useState<number | null>(null);

  const [form, setForm] = useState<FormState>(FORM_VIDE);
  const [soumission, setSoumission] = useState(false);
  const [nbExemplaires, setNbExemplaires] = useState(1);
  const [actionEnCours, setActionEnCours] = useState<"emprunt"|"reservation"|null>(null);

  const charger = async () => {
    setChargement(true);
    try { setLivres(await obtenirLivres()); }
    finally { setChargement(false); }
  };

  useEffect(() => { charger(); }, []);

  const majChamp = (key: keyof FormState, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const ouvrirEdition = (l: any) => {
    setForm({
      titre: l.titre, auteur: l.auteur ?? "", isbn: l.isbn ?? "",
      annee_publication: String(l.annee_publication ?? ""), genre: l.genre ?? "",
      note: String(l.note ?? ""), total_exemplaires: String(l.total_exemplaires),
      couverture: l.couverture ?? "", description: l.description ?? "",
    });
    setLivreEdite(l);
    setModalAjout(true);
  };

  const fermerModal = () => { setModalAjout(false); setLivreEdite(null); setForm(FORM_VIDE); };

  const handleSauvegarder = async () => {
    if (!form.titre) { toast({ title: "Titre requis", variant: "destructive" }); return; }
    setSoumission(true);
    try {
      const payload = {
        titre: form.titre, auteur: form.auteur || null, isbn: form.isbn || null,
        annee_publication: form.annee_publication ? Number(form.annee_publication) : null,
        genre: form.genre || null, note: form.note ? Number(form.note) : null,
        total_exemplaires: Number(form.total_exemplaires) || 1,
        couverture: form.couverture || null, description: form.description || null,
      };
      if (livreEdite) { await modifierLivre(livreEdite.id, payload); toast({ title: "Livre modifié" }); }
      else             { await creerLivre(payload);                   toast({ title: "Livre ajouté au catalogue" }); }
      fermerModal();
      charger();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSoumission(false); }
  };

  const handleSupprimer = async (id: number) => {
    try {
      await supprimerLivre(id);
      toast({ title: "Livre supprimé" });
      setConfirmSuppr(null); charger();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleAjouterExemplaires = async (id: number) => {
    try {
      await ajouterExemplaires(id, nbExemplaires);
      toast({ title: `${nbExemplaires} exemplaire(s) ajouté(s)` });
      charger();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  // Bouton unique : emprunter si dispo, réserver sinon
  const handleActionLivre = async (livre: any) => {
    if (!utilisateur?.id) return;
    const action: "emprunt"|"reservation" = livre.exemplaires_disponibles > 0 ? "emprunt" : "reservation";
    setActionEnCours(action);
    try {
      if (action === "emprunt") {
        await creerEmprunt({ utilisateur_id: utilisateur.id, livre_id: livre.id, en_ligne: true });
        toast({
          title: "Emprunt enregistré",
          description: "Vous avez 24h pour vous présenter à la bibliothèque et récupérer votre livre.",
        });
      } else {
        await creerReservation({ utilisateur_id: utilisateur.id, livre_id: livre.id });
        toast({
          title: "Réservation enregistrée",
          description: "Vous serez notifié automatiquement dès qu'un exemplaire est disponible.",
        });
      }
      setLivreDetail(null);
      charger();
    } catch (e: any) {
      toast({ title: "Impossible", description: e.message, variant: "destructive" });
    } finally { setActionEnCours(null); }
  };

  const estAdmin = utilisateur?.role === "admin";
  const filtres = livres.filter(l => {
    const q = recherche.toLowerCase();
    return (
      (!q || l.titre?.toLowerCase().includes(q) || l.auteur?.toLowerCase().includes(q)) &&
      (genreFiltre === "Tous" || l.genre === genreFiltre) &&
      (!disponibleSeulement || l.exemplaires_disponibles > 0)
    );
  });

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Catalogue</h1>
          <p className="text-sm text-muted-foreground">{filtres.length} / {livres.length} livre(s)</p>
        </div>
        {estAdmin && (
          <Button onClick={() => { setLivreEdite(null); setForm(FORM_VIDE); setModalAjout(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter un livre
          </Button>
        )}
      </motion.div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher titre, auteur..." value={recherche} onChange={e => setRecherche(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {GENRES.slice(0, 6).map(g => (
            <button key={g} onClick={() => setGenreFiltre(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${genreFiltre === g ? "bg-primary/15 text-primary border-primary/30" : "border-border/50 text-muted-foreground hover:border-primary/20"}`}>
              {g}
            </button>
          ))}
        </div>
        <button onClick={() => setDisponibleSeulement(!disponibleSeulement)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 ${disponibleSeulement ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "border-border/50 text-muted-foreground"}`}>
          <Filter className="h-3 w-3" /> Disponibles
        </button>
      </div>

      {/* Grille livres */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {chargement && [...Array(12)].map((_, i) => <div key={i} className="h-64 rounded-xl animate-shimmer" />)}
        {!chargement && filtres.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun livre trouvé</p>
          </div>
        )}
        <AnimatePresence>
          {filtres.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }} layout>
              <div className="glass-card rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setLivreDetail(l)}>
                <div className="relative overflow-hidden">
                  {l.couverture
                    ? <img src={l.couverture} alt={l.titre} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-44 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"><BookOpen className="h-10 w-10 text-primary/50" /></div>
                  }
                  <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${l.exemplaires_disponibles > 0 ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
                    {l.exemplaires_disponibles > 0 ? `${l.exemplaires_disponibles} dispo` : "Indispo"}
                  </div>
                  {estAdmin && (
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); ouvrirEdition(l); }}
                        className="h-7 w-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-primary/80 transition-colors">
                        <Pencil className="h-3 w-3 text-white" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setConfirmSuppr(l.id); }}
                        className="h-7 w-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/80 transition-colors">
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-xs leading-tight truncate">{l.titre}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{l.auteur}</p>
                  {l.note && <NotesEtoiles note={l.note} />}
                  {l.genre && <span className="inline-block mt-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">{l.genre}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Ajout/Édition (admin) */}
      <AnimatePresence>
        {modalAjout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && fermerModal()}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="glass-card rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-display font-bold">{livreEdite ? "Modifier le livre" : "Ajouter un livre"}</h2>
                <button onClick={fermerModal} className="h-8 w-8 rounded-lg hover:bg-card flex items-center justify-center">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* FormLivre est un composant EXTERNE — pas de re-création à chaque frappe */}
              <FormLivre form={form} onChange={majChamp} />

              {livreEdite && (
                <div className="mt-4 p-3 rounded-xl border border-border/50 bg-card/30">
                  <p className="text-xs text-muted-foreground mb-2">Ajouter des exemplaires</p>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={1} max={50} value={nbExemplaires}
                      onChange={e => setNbExemplaires(Number(e.target.value))} className="w-20 h-8" />
                    <Button size="sm" variant="outline" className="gap-1 h-8"
                      onClick={() => handleAjouterExemplaires(livreEdite.id)}>
                      <PlusCircle className="h-3.5 w-3.5" /> Ajouter
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-5">
                <Button variant="outline" className="flex-1" onClick={fermerModal}>Annuler</Button>
                <Button className="flex-1" onClick={handleSauvegarder} disabled={soumission}>
                  {soumission ? "..." : livreEdite ? "Enregistrer" : "Ajouter"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Détail livre */}
      <AnimatePresence>
        {livreDetail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setLivreDetail(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="glass-card rounded-2xl w-full max-w-sm p-6">
              <div className="flex justify-end mb-2">
                <button onClick={() => setLivreDetail(null)} className="h-8 w-8 rounded-lg hover:bg-card flex items-center justify-center">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {livreDetail.couverture && (
                <img src={livreDetail.couverture} alt={livreDetail.titre} className="w-28 h-40 object-cover rounded-xl mx-auto mb-4 shadow-lg" />
              )}
              <h3 className="font-display font-bold text-lg text-center">{livreDetail.titre}</h3>
              <p className="text-sm text-muted-foreground text-center">{livreDetail.auteur}</p>
              {livreDetail.note && <div className="flex justify-center mt-2"><NotesEtoiles note={livreDetail.note} /></div>}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                {livreDetail.genre && <div className="bg-card/60 rounded-lg p-2"><p className="text-muted-foreground">Genre</p><p className="font-medium">{livreDetail.genre}</p></div>}
                {livreDetail.annee_publication && <div className="bg-card/60 rounded-lg p-2"><p className="text-muted-foreground">Année</p><p className="font-medium">{livreDetail.annee_publication}</p></div>}
                <div className="bg-card/60 rounded-lg p-2"><p className="text-muted-foreground">Exemplaires</p><p className="font-medium">{livreDetail.exemplaires_disponibles}/{livreDetail.total_exemplaires}</p></div>
                {livreDetail.isbn && <div className="bg-card/60 rounded-lg p-2"><p className="text-muted-foreground">ISBN</p><p className="font-medium truncate">{livreDetail.isbn}</p></div>}
              </div>
              {livreDetail.description && (
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed line-clamp-4">{livreDetail.description}</p>
              )}

              {/* Bouton unique : Emprunter si dispo, Réserver sinon (membres uniquement) */}
              {!estAdmin && (
                <div className="mt-5">
                  <Button
                    className={`w-full gap-2 ${livreDetail.exemplaires_disponibles === 0 ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                    onClick={() => handleActionLivre(livreDetail)}
                    disabled={actionEnCours !== null}
                  >
                    {livreDetail.exemplaires_disponibles > 0
                      ? <><BookCopy className="h-4 w-4" />{actionEnCours === "emprunt" ? "Enregistrement..." : "Emprunter ce livre"}</>
                      : <><BookMarked className="h-4 w-4" />{actionEnCours === "reservation" ? "Enregistrement..." : "Réserver ce livre"}</>
                    }
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2 leading-relaxed">
                    {livreDetail.exemplaires_disponibles > 0
                      ? "Emprunt en ligne — 24h pour venir récupérer à la bibliothèque."
                      : "Réservation — vous serez automatiquement notifié quand un exemplaire est disponible."}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation suppression */}
      <AnimatePresence>
        {confirmSuppr !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card rounded-2xl w-full max-w-sm p-6 text-center">
              <Trash2 className="h-10 w-10 text-destructive mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg mb-2">Supprimer ce livre ?</h3>
              <p className="text-sm text-muted-foreground mb-5">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmSuppr(null)}>Annuler</Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleSupprimer(confirmSuppr!)}>Supprimer</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
