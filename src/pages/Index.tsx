import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  TrendingUp,
  Clock,
  BookMarked,
  Bell,
} from "lucide-react";
import StatsCard from "@/components/StatsCard";
import BookCard from "@/components/BookCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentBooks = [
  {
    title: "Dune",
    author: "Frank Herbert",
    cover:
      "https://actualitte.com/uploads/images/duune-8e8c19e2-30d3-47c5-b624-c0849c2008c5.jpg",
    genre: "Science-Fiction",
    rating: 4.8,
    available: true,
  },
  {
    title: "1984",
    author: "George Orwell",
    cover:
      "https://images.epagine.fr/100/9782070248100_1_75.jpg",
    genre: "Dystopie",
    rating: 4.7,
    available: false,
  },
  {
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    cover:
      "https://m.media-amazon.com/images/I/914RHT4YJaL._SX500_.jpg",
    genre: "Conte",
    rating: 4.9,
    available: true,
  },
  {
    title: "L'Étranger",
    author: "Albert Camus",
    cover:
      "https://i.pinimg.com/564x/6f/fa/4e/6ffa4ecd1931e36640110d801f4e8483.jpg",
    genre: "Roman",
    rating: 4.5,
    available: true,
  },
];

const recentActivity = [
  {
    user: "DOE-BRUCE Folly",
    action: "a emprunté",
    book: "Dune",
    time: "Il y a 2h",
    type: "borrow",
  },
  {
    user: "DIALLO Mariam",
    action: "a retourné",
    book: "Les Misérables",
    time: "Il y a 3h",
    type: "return",
  },
  {
    user: "VOSSA Junior",
    action: "a réservé",
    book: "1984",
    time: "Il y a 5h",
    type: "reserve",
  },
  {
    user: "ADANDJI Yaovi",
    action: "pénalité de retard",
    book: "Germinal",
    time: "Il y a 1j",
    type: "penalty",
  },
];

const activityColors: Record<string, string> = {
  borrow: "bg-primary/15 text-primary",
  return: "bg-success/15 text-success",
  reserve: "bg-accent/15 text-accent",
  penalty: "bg-destructive/15 text-destructive",
};

const Index = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    import("@/lib/api").then(({ getStats }) =>
      getStats()
        .then((data) => mounted && setStats(data))
        .catch(() => mounted && setStats(null))
        .finally(() => mounted && setLoading(false)),
    );
    return () => {
      mounted = false;
    };
  }, []);

  if (user && user.role !== "admin") {
    return (
      <div className="space-y-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold">Mon espace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bienvenue{user.name ? `, ${user.name}` : ""} — accédez à vos
            emprunts, réservations et notifications via le menu.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenue sur ESGIS Library — vue d'ensemble
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Livres"
          value={loading || !stats ? "..." : stats.total_books.toLocaleString()}
          change="+8 ce mois"
          changeType="positive"
          icon={BookOpen}
          glowColor="primary"
        />
        <StatsCard
          title="Membres"
          value={
            loading || !stats ? "..." : stats.total_members.toLocaleString()
          }
          change="+4 ce mois"
          changeType="positive"
          icon={Users}
          glowColor="accent"
        />
        <StatsCard
          title="Emprunts actifs"
          value={
            loading || !stats ? "..." : stats.active_borrowings.toLocaleString()
          }
          change="-3 aujourd'hui"
          changeType="neutral"
          icon={ArrowLeftRight}
          glowColor="success"
        />
        <StatsCard
          title="Pénalités"
          value={loading || !stats ? "..." : stats.penalties.toLocaleString()}
          change="+2 cette semaine"
          changeType="negative"
          icon={AlertTriangle}
          glowColor="destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-display font-semibold mb-4">
            Ajouts récents
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentBooks.map((book) => (
              <BookCard key={book.title} {...book} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-display font-semibold mb-4">
            Activité récente
          </h2>
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {recentActivity.map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 flex items-start gap-3"
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${activityColors[activity.type]}`}
                    >
                      {activity.user.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">
                          {activity.action}
                        </span>{" "}
                        <span className="font-medium">{activity.book}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
