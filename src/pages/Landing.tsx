import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Users,
  Shield,
  ArrowRight,
  Star,
  Clock,
  ChevronDown,
} from "lucide-react";
import EsgisLogo from "@/components/EsgisLogo";
import { Button } from "@/components/ui/button";

const BOOKS = [
  {
    title: "Le Petit Prince",
    author: "Saint-Exupéry",
    cover: "https://m.media-amazon.com/images/I/914RHT4YJaL._SX500_.jpg",
    color: "#4fd1c7",
  },
  {
    title: "1984",
    author: "George Orwell",
    cover: "https://images.epagine.fr/100/9782070248100_1_75.jpg",
    color: "#9f7aea",
  },
  {
    title: "L'Étranger",
    author: "Albert Camus",
    cover:
      "https://i.pinimg.com/564x/6f/fa/4e/6ffa4ecd1931e36640110d801f4e8483.jpg",
    color: "#f6ad55",
  },
  {
    title: "Les Misérables",
    author: "Victor Hugo",
    cover:
      "https://products-images.di-static.com/image/hugo-victor-les-miserables/9782017261438-475x500-1.webp",
    color: "#68d391",
  },
  {
    title: "Monte-Cristo",
    author: "Alexandre Dumas",
    cover: "https://m.media-amazon.com/images/I/71ZcP22phyL._SX500_.jpg",
    color: "#fc8181",
  },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Catalogue Complet",
    desc: "Parcourez des centaines de livres avec un système d'exemplaires en temps réel.",
    color: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    icon: Clock,
    title: "Emprunts & Réservations",
    desc: "Empruntez instantanément ou réservez votre place dans la file d'attente.",
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    icon: Users,
    title: "Espace Membre",
    desc: "Suivez vos emprunts, réservations et notifications en un seul endroit.",
    color: "from-amber-500/20 to-amber-500/5",
  },
  {
    icon: Shield,
    title: "Accès Sécurisé",
    desc: "Inscription par code d'accès, espace admin séparé et données protégées.",
    color: "from-green-500/20 to-green-500/5",
  },
];

const FloatingBook = ({
  book,
  index,
}: {
  book: (typeof BOOKS)[0];
  index: number;
}) => {
  const angle = (index / BOOKS.length) * Math.PI * 2;
  const radius = 260;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius * 0.45;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px - 45px)`,
        top: `calc(50% + ${y}px - 60px)`,
      }}
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: index % 2 === 0 ? -8 : 8 }}
      transition={{ delay: 0.4 + index * 0.15, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.15, rotate: 0, zIndex: 10 }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3 + index * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <div
          className="w-[88px] h-[120px] rounded-lg overflow-hidden shadow-2xl border border-white/10"
          style={{ boxShadow: `0 0 30px ${book.color}40` }}
        >
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-3 rounded-full blur-sm opacity-40"
          style={{ backgroundColor: book.color }}
        />
      </motion.div>
    </motion.div>
  );
};

const CountUp = ({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setActiveFeature((p) => (p + 1) % FEATURES.length),
      3000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(220,25%,6%)] text-white overflow-x-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/5 backdrop-blur-xl bg-[hsl(220,25%,6%)]/80"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <EsgisLogo size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">
            ESGIS Library
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-muted-foreground hover:text-white"
            >
              Connexion
            </Button>
          </Link>
          <Link to="/register">
            <Button
              size="sm"
              className="text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              S'inscrire
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl bg-primary" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] border border-primary/5 rounded-full"
          />
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>

        <motion.div
          style={{ y: heroY }}
          className="relative z-10 text-center px-4 max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-8"
          >
            <Sparkles className="h-3 w-3" />
            Système de gestion de bibliothèque moderne développé par AFELI YB
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
            className="text-5xl md:text-7xl font-bold leading-tight tracking-tight"
          >
            La bibliothèque
            <br />
            <span className="bg-gradient-to-r from-primary via-cyan-300 to-primary bg-clip-text text-transparent animate-pulse">
              réinventée
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Gérez vos emprunts, suivez les disponibilités en temps réel et
            découvrez de nouveaux livres avec une expérience numérique fluide et
            élégante.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base shadow-[0_0_30px_hsl(185,75%,48%,0.4)] hover:shadow-[0_0_50px_hsl(185,75%,48%,0.6)] transition-all duration-300"
              >
                Créer un compte
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="ghost"
                className="px-8 text-base text-white bg-transparent border border-white/20 hover:bg-white/10 hover:text-white hover:border-primary/50 transition-all duration-300"
              >
                Se connecter
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating books orbit */}
        <div className="relative w-[600px] h-[300px] mt-16 hidden md:block">
          {BOOKS.map((book, i) => (
            <FloatingBook key={i} book={book} index={i} />
          ))}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 20px hsl(185 75% 48% / 0.3)",
                "0 0 40px hsl(185 75% 48% / 0.5)",
                "0 0 20px hsl(185 75% 48% / 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <EsgisLogo size={32} />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/50"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 500, suffix: "+", label: "Livres disponibles" },
            { value: 1200, suffix: "+", label: "Membres actifs" },
            { value: 98, suffix: "%", label: "Satisfaction" },
            { value: 24, suffix: "/7", label: "Accès en ligne" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-primary">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Une plateforme complète pour gérer votre bibliothèque, de
              l'emprunt à la réservation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.02 }}
                className={`rounded-2xl p-6 border border-white/8 bg-gradient-to-br ${feature.color} cursor-default`}
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Book showcase */}
      <section className="py-20 px-6 overflow-hidden border-y border-white/5 bg-white/[0.02]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">
            Des livres pour tous les goûts
          </h2>
          <p className="text-muted-foreground">
            Explorez notre catalogue riche et diversifié
          </p>
        </motion.div>

        <div className="flex gap-6 overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex gap-6 shrink-0"
          >
            {[...BOOKS, ...BOOKS].map((book, i) => (
              <div key={i} className="shrink-0 w-28 group">
                <div
                  className="rounded-lg overflow-hidden border border-white/10 shadow-xl transition-transform group-hover:scale-105 duration-300"
                  style={{ boxShadow: `0 0 20px ${book.color}30` }}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                </div>
                <div className="mt-2 px-1">
                  <p className="text-xs font-medium truncate">{book.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {book.author}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Ce que disent nos membres
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "DOE-BRUCE F.",
                role: "Étudiante",
                text: "Super pratique ! Je réserve mes livres depuis chez moi et je les récupère quand c'est prêt.",
                stars: 5,
              },
              {
                name: "Jean-Paul M.",
                role: "Enseignant",
                text: "L'interface est belle et rapide. Les notifications me préviennent à temps pour les retours.",
                stars: 5,
              },
              {
                name: "Sarah B.",
                role: "Chercheuse",
                text: "Enfin un système de bibliothèque moderne. Le suivi des emprunts est impeccable.",
                stars: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-semibold text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>
          <EsgisLogo size={48} className="mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à rejoindre ESGIS Library ?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Rejoignez des centaines de membres qui profitent déjà de notre
            bibliothèque universitaire.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 shadow-[0_0_40px_hsl(185,75%,48%,0.4)]"
              >
                S'inscrire maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="ghost"
                className="px-10 text-white bg-transparent border border-white/20 hover:bg-white/10 hover:text-white hover:border-primary/50 transition-all duration-300"
              >
                J'ai déjà un compte
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <EsgisLogo size={20} />
          <span className="font-semibold text-white">ESGIS Library</span>
        </div>
        <p>
          © {new Date().getFullYear()} ESGIS Library — Developed by AFELI YB
        </p>
      </footer>
    </div>
  );
}
