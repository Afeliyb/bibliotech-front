import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getReservations,
  getBooks,
  getUsers,
  updateReservationStatus,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const Reservations = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getReservations(), getBooks(), getUsers()])
      .then(([rs, bs, us]) => {
        if (!mounted) return;
        setReservations(rs || []);
        setBooks(bs || []);
        setUsers(us || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const getBook = (id: number) =>
    books.find((b) => b.id === id) || { title: "Inconnu" };
  const getUser = (id: number) =>
    users.find((u) => u.id === id) || { name: "Inconnu" };

  const handleSetReady = async (id: number) => {
    await updateReservationStatus(id, "ready");
    setReservations((s) =>
      s.map((r) => (r.id === id ? { ...r, status: "ready" } : r)),
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold">Réservations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestion des files de réservation
        </p>
      </motion.div>

      <div className="space-y-3">
        {loading && (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        )}
        {!loading && reservations.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune réservation</p>
        )}
        {(() => {
          const me = users.find((u) => u.email === user?.email);
          const myId = me?.id;
          const displayed =
            user && user.role !== "admin"
              ? reservations.filter((rr) => rr.user_id === myId)
              : reservations;
          return displayed.map((r) => (
            <Card key={r.id} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">
                      {getBook(r.book_id).title}
                    </p>
                    <Badge
                      variant={r.status === "ready" ? "default" : "outline"}
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Réservé par: {getUser(r.user_id).name}
                  </p>
                </div>
                {user?.role === "admin" && r.status !== "ready" && (
                  <Button onClick={() => handleSetReady(r.id)}>
                    Marquer prêt
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

export default Reservations;
