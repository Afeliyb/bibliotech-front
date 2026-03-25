import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenirInfoBibliotheque } from "@/lib/api";
import { MapPin, Phone, Clock, BookOpen, AlertTriangle, CalendarClock, Info, Globe, Mail } from "lucide-react";

export default function InfoBibliotheque() {
  const [info, setInfo] = useState<any>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    obtenirInfoBibliotheque().then(setInfo).catch(() => {}).finally(() => setChargement(false));
  }, []);

  if (chargement) return (
    <div className="space-y-4 max-w-3xl">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl animate-shimmer" />)}
    </div>
  );

  const sections = [
    {
      titre: "Informations générales",
      icone: Info,
      couleur: "text-primary",
      items: [
        info?.nom && { label: "Nom", valeur: info.nom },
        info?.adresse && { label: "Adresse", valeur: info.adresse, icone: MapPin },
        info?.telephone && { label: "Téléphone", valeur: info.telephone, icone: Phone },
        info?.email_contact && { label: "Email", valeur: info.email_contact, icone: Mail },
        info?.site_web && { label: "Site web", valeur: info.site_web, icone: Globe },
      ].filter(Boolean),
    },
    {
      titre: "Horaires d'ouverture",
      icone: Clock,
      couleur: "text-emerald-400",
      items: info?.horaires ? [{ label: "Horaires", valeur: info.horaires }] : [{ label: "", valeur: "Non renseignés" }],
    },
    {
      titre: "Règles d'emprunt",
      icone: BookOpen,
      couleur: "text-blue-400",
      items: [
        { label: "Livres empruntables", valeur: `${info?.max_emprunts_par_membre ?? 3} livres max simultanément` },
        { label: "Durée d'emprunt", valeur: `${info?.duree_emprunt_jours ?? 14} jours maximum` },
        { label: "Réservations", valeur: `${info?.max_reservations_par_membre ?? 3} réservations actives max` },
        { label: "Délai de retrait", valeur: `${info?.delai_retrait_heures ?? 48}h pour récupérer après notification` },
      ],
    },
    {
      titre: "Pénalités de retard",
      icone: AlertTriangle,
      couleur: "text-red-400",
      items: [
        { label: "Montant/jour", valeur: `${info?.penalite_par_jour ?? 500} FCFA par jour de retard` },
        { label: "Pénalité maximum", valeur: `${(info?.penalite_maximum ?? 10000).toLocaleString("fr-FR")} FCFA` },
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Ma bibliothèque</h1>
        <p className="text-sm text-muted-foreground mt-1">Informations, horaires et règles de la bibliothèque</p>
      </motion.div>

      <div className="grid gap-4">
        {sections.map((section, si) => {
          if (!section.items || section.items.length === 0) return null;
          const Icone = section.icone;
          return (
            <motion.div key={si} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.08 }}>
              <Card className="border-border/50 glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icone className={`h-4 w-4 ${section.couleur}`} />
                    {section.titre}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {section.items.map((item: any, ii: number) => (
                    <div key={ii} className="flex justify-between items-start gap-4 py-1.5 border-b border-border/30 last:border-0">
                      {item.label && <span className="text-xs text-muted-foreground w-32 shrink-0">{item.label}</span>}
                      <span className="text-sm font-medium text-right flex-1">{item.valeur}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Règles détaillées */}
        {info?.regles && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="border-border/50 glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-purple-400" />
                  Règlement intérieur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {info.regles}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
