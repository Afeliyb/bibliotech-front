import { motion } from "framer-motion";
import { BookOpen, Star, Clock, BookCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookCardProps {
  title: string;
  author?: string;
  cover?: string;
  genre?: string;
  rating?: number;
  total_copies: number;
  available_copies: number;
  onBorrow?: () => void;
  onReserve?: () => void;
  onClick?: () => void;
}

const BookCard = ({ title, author, cover, genre, rating, total_copies = 1, available_copies = 0, onBorrow, onReserve, onClick }: BookCardProps) => {
  const available = available_copies > 0;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }} whileHover={{ y: -4 }} className="group">
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_hsl(185,75%,48%,0.15)]">
        {/* Image — cliquable pour le détail */}
        <div className="aspect-[3/4] relative overflow-hidden bg-secondary cursor-pointer" onClick={onClick}>
          {cover ? (
            <img src={cover} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <BookOpen className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={available ? "default" : "secondary"}
              className={available ? "bg-success text-success-foreground text-[10px]" : "text-[10px]"}>
              {available ? `${available_copies} dispo.` : "Épuisé"}
            </Badge>
          </div>
          {/* Hover overlay "Voir détails" */}
          {onClick && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">Voir détails</span>
            </div>
          )}
        </div>
        <div className="p-3">
          {genre && <p className="text-[10px] uppercase tracking-wider text-primary font-medium">{genre}</p>}
          <h3 className="font-display font-semibold text-sm mt-0.5 line-clamp-2 leading-tight cursor-pointer hover:text-primary transition-colors" onClick={onClick}>
            {title}
          </h3>
          {author && <p className="text-xs text-muted-foreground mt-0.5 truncate">{author}</p>}
          <div className="flex items-center justify-between mt-2">
            {rating ? (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-accent fill-accent" />
                <span className="text-xs font-medium">{rating.toFixed(1)}</span>
              </div>
            ) : <span />}
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookCopy className="h-3 w-3" />
              <span className="text-[10px]">{available_copies}/{total_copies}</span>
            </div>
          </div>
          <div className="mt-3">
            {available ? (
              <Button size="sm" className="w-full text-xs h-8" onClick={onBorrow}>Emprunter</Button>
            ) : (
              <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={onReserve}>
                <Clock className="h-3 w-3 mr-1" />Réserver
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
