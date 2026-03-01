import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPenalties, payPenalty, getUsers } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const Penalties = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getPenalties(), getUsers()])
      .then(([ps, us]) => {
        if (!mounted) return;
        setPenalties(ps || []);
        setUsers(us || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const getUser = (id: number) =>
    users.find((u) => u.id === id) || { name: "Inconnu" };

  const handlePay = async (id: number) => {
    await payPenalty(id);
    setPenalties((s) => s.map((p) => (p.id === id ? { ...p, paid: true } : p)));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold">Pénalités</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Liste des pénalités applicables
        </p>
      </motion.div>

      <div className="space-y-3">
        {loading && (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        )}
        {!loading && penalties.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune pénalité</p>
        )}
        {(() => {
          const me = users.find((u) => u.email === user?.email);
          const myId = me?.id;
          const displayed =
            user && user.role !== "admin"
              ? penalties.filter((pp) => pp.user_id === myId)
              : penalties;
          return displayed.map((p) => (
            <Card key={p.id} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{p.reason}</p>
                    <Badge variant={p.paid ? "outline" : "destructive"}>
                      {p.paid ? "Payée" : "Impayée"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilisateur: {getUser(p.user_id).name}
                  </p>

                 <p className="text-xs text-muted-foreground mt-1">
  Montant: {p.amount.toLocaleString()} FCFA 
  </p>

                </div>
                {!p.paid && user?.role === "admin" && (
                  <Button variant="default" onClick={() => handlePay(p.id)}>
                    Marquer payée
                  </Button>
                )}
              </CardContent>
            </Card>
          ));
        })()}
      </div>
    </div>
  );
};

export default Penalties;
