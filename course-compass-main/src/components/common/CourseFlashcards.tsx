import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Loader2, RotateCcw, Shuffle, Sparkles } from "lucide-react";
import { featureApi } from "@/api/feature.api";
import { useAuth } from "@/store/AuthContext";
import { apiErrorMessage } from "@/utils/apiError";

type Flashcard = { id: string; question: string; answer: string; order: number };
type FlashcardDeck = {
  id: string;
  courseId?: string | null;
  title: string;
  description?: string;
  subject: string;
  category: string;
  difficulty: string;
  cards?: Flashcard[];
  progress?: Array<{ currentCard: number; viewedCards: number }>;
};

export function CourseFlashcards({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [viewed, setViewed] = useState(0);

  useEffect(() => {
    let active = true;
    featureApi
      .flashcardDecks()
      .then(({ data }) => {
        if (!active) return;
        const related = (data.data || []).filter(
          (item: FlashcardDeck) =>
            String(item.courseId || "") === String(courseId) &&
            Array.isArray(item.cards) &&
            item.cards.length > 0,
        );
        setDecks(related);
        if (related.length) {
          const first = related[0];
          setDeck(first);
          const saved = first.progress?.[0];
          const safeIndex = Math.min(
            saved?.currentCard || 0,
            Math.max((first.cards?.length || 1) - 1, 0),
          );
          setIndex(safeIndex);
          setViewed(saved?.viewedCards || 0);
        }
      })
      .catch((err) => {
        if (active) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  const cards = useMemo(() => deck?.cards || [], [deck]);
  const current = cards[index];
  const hasMultipleDecks = decks.length > 1;

  const persist = (nextIndex: number, nextViewed: number) => {
    if (!deck || !isAuthenticated) return;
    featureApi.saveFlashcardProgress(deck.id, { currentCard: nextIndex, viewedCards: nextViewed }).catch(() => {});
  };

  const selectDeck = (nextDeck: FlashcardDeck) => {
    setDeck(nextDeck);
    const saved = nextDeck.progress?.[0];
    const safeIndex = Math.min(saved?.currentCard || 0, Math.max((nextDeck.cards?.length || 1) - 1, 0));
    setIndex(safeIndex);
    setViewed(saved?.viewedCards || 0);
    setFlipped(false);
  };

  const move = (direction: number) => {
    if (!cards.length) return;
    const next = (index + direction + cards.length) % cards.length;
    const nextViewed = Math.max(viewed, Math.min(cards.length, next + 1));
    setIndex(next);
    setViewed(nextViewed);
    setFlipped(false);
    persist(next, nextViewed);
  };

  const shuffleToRandomCard = () => {
    if (!cards.length) return;
    if (cards.length === 1) {
      setFlipped(false);
      return;
    }
    let next = index;
    while (next === index) {
      next = Math.floor(Math.random() * cards.length);
    }
    const nextViewed = Math.max(viewed, next + 1);
    setIndex(next);
    setViewed(nextViewed);
    setFlipped(false);
    persist(next, nextViewed);
  };

  if (loading) {
    return (
      <div className="surface-card mt-6 flex items-center justify-center gap-3 py-10">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading flashcards for this course</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-card mt-6">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="surface-card mt-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-bold">Flashcards for this course</h3>
            <p className="text-sm text-muted-foreground">
              No flashcards have been added to {courseTitle} yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="surface-card mt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="page-eyebrow">Course flashcards</p>
          <h3 className="mt-2 text-2xl font-bold">{deck.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Flip the card to reveal the answer. Use the arrows to move through the deck.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasMultipleDecks && (
            <select
              value={deck.id}
              onChange={(event) => {
                const nextDeck = decks.find((item) => item.id === event.target.value);
                if (nextDeck) selectDeck(nextDeck);
              }}
              className="h-10 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground"
            >
              {decks.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          )}
          <div className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
            {index + 1} / {cards.length}
          </div>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
          style={{ width: `${cards.length ? ((index + 1) / cards.length) * 100 : 0}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="mt-6 block h-[320px] w-full rounded-[2rem] border border-border bg-background/70 p-0 text-left shadow-[var(--shadow-overlay)] [perspective:1200px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <span className={`relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
          <span className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-border bg-gradient-to-br from-primary/12 via-card to-secondary/10 p-8 text-center [backface-visibility:hidden]">
            <span className="mb-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Question
            </span>
            <strong className="max-w-2xl text-2xl leading-relaxed text-foreground">
              {current?.question}
            </strong>
            <span className="mt-6 text-sm text-muted-foreground">Click to reveal the answer</span>
          </span>
          <span className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-border bg-gradient-to-br from-secondary/12 via-card to-primary/10 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="mb-4 rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              Answer
            </span>
            <strong className="max-w-2xl text-2xl leading-relaxed text-foreground">
              {current?.answer}
            </strong>
            <span className="mt-6 text-sm text-muted-foreground">Click to see the question again</span>
          </span>
        </span>
      </button>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button type="button" className="btn-outline-teal" onClick={() => move(-1)} disabled={!cards.length}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          type="button"
          className="btn-outline-teal"
          onClick={shuffleToRandomCard}
          disabled={cards.length < 2}
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </button>
        <button type="button" className="btn-outline-teal" onClick={() => setFlipped(false)}>
          <RotateCcw className="h-4 w-4" />
          Reset flip
        </button>
        <button type="button" className="btn-primary" onClick={() => move(1)} disabled={!cards.length}>
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>
          {viewed} card{viewed === 1 ? "" : "s"} viewed in this deck
        </span>
      </div>
    </section>
  );
}
