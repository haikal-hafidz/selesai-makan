import React, { useState } from 'react';
import {
  Plus,
  Play,
  RotateCw,
  Trash2,
  Calendar,
} from 'lucide-react';
import {
  FlashcardDeck,
  Flashcard,
  ReviewRating,
  LearningClass,
} from '../types';
import {
  createDefaultSchedule,
  calculateNextReview,
} from '../services/spacedRepetition';

interface FlashcardsViewProps {
  decks: FlashcardDeck[];
  cards: Flashcard[];
  classes: LearningClass[];
  onSaveDeck: (deck: FlashcardDeck) => Promise<void>;
  onDeleteDeck: (deckId: string) => Promise<void>;
  onSaveCard: (card: Flashcard) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  decks,
  cards,
  classes,
  onSaveDeck,
  onDeleteDeck,
  onSaveCard,
  onDeleteCard,
}) => {
  const [activeDeckId, setActiveDeckId] = useState<string | null>(
    decks.length > 0 ? decks[0].id : null
  );

  // Review session state
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);

  // Create Deck / Card modals
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckClassId, setNewDeckClassId] = useState('');

  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardExplanation, setCardExplanation] = useState('');

  const activeDeck = decks.find((d) => d.id === activeDeckId);
  const activeDeckCards = cards.filter((c) => c.deckId === activeDeckId);

  const now = Date.now();
  const dueCardsInActiveDeck = activeDeckCards.filter((c) => c.schedule.nextReviewAt <= now);

  const startReviewSession = (allCards: boolean = false) => {
    const target = allCards ? activeDeckCards : dueCardsInActiveDeck;
    if (target.length === 0) return;
    setSessionCards(target);
    setReviewIndex(0);
    setIsFlipped(false);
    setIsReviewing(true);
  };

  const handleRateCard = async (rating: ReviewRating) => {
    const currentCard = sessionCards[reviewIndex];
    if (!currentCard) return;

    const newSchedule = calculateNextReview(currentCard.schedule, rating);
    const updatedCard: Flashcard = {
      ...currentCard,
      schedule: newSchedule,
      updatedAt: Date.now(),
    };

    await onSaveCard(updatedCard);

    if (reviewIndex + 1 < sessionCards.length) {
      setReviewIndex(reviewIndex + 1);
      setIsFlipped(false);
    } else {
      // Completed session
      setIsReviewing(false);
    }
  };

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) return;
    const newDeck: FlashcardDeck = {
      id: crypto.randomUUID(),
      title: newDeckTitle.trim(),
      description: newDeckDesc.trim(),
      classId: newDeckClassId || undefined,
      tags: ['General'],
      color: '#8b5cf6',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await onSaveDeck(newDeck);
    setActiveDeckId(newDeck.id);
    setIsDeckModalOpen(false);
    setNewDeckTitle('');
    setNewDeckDesc('');
  };

  const handleCreateCard = async () => {
    if (!cardFront.trim() || !cardBack.trim() || !activeDeckId) return;
    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      deckId: activeDeckId,
      front: cardFront.trim(),
      back: cardBack.trim(),
      explanation: cardExplanation.trim() || undefined,
      tags: [],
      schedule: createDefaultSchedule(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await onSaveCard(newCard);
    setIsCardModalOpen(false);
    setCardFront('');
    setCardBack('');
    setCardExplanation('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Flashcards & Spaced Repetition
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Master formulas, concepts, and terminology with the SM-2 active-recall interval scheduling system.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDeckModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs transition cursor-pointer shadow-2xs"
          >
            <Plus size={15} />
            <span>New Deck</span>
          </button>
        </div>
      </div>

      {/* Review Mode Modal / Fullscreen */}
      {isReviewing && sessionCards.length > 0 && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-lg max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
              Reviewing: Card {reviewIndex + 1} of {sessionCards.length}
            </span>
            <button
              type="button"
              onClick={() => setIsReviewing(false)}
              className="text-stone-400 hover:text-stone-700 font-semibold cursor-pointer"
            >
              Exit Review
            </button>
          </div>

          {/* Flashcard Body */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[220px] p-8 rounded-2xl border-2 border-dashed border-stone-300 hover:border-purple-400 bg-stone-50/50 flex flex-col items-center justify-center text-center cursor-pointer transition select-none"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              {isFlipped ? 'Answer (Click to Flip)' : 'Prompt / Question (Click to Reveal)'}
            </div>
            <div className="text-lg font-bold text-stone-900 max-w-lg leading-relaxed">
              {isFlipped ? sessionCards[reviewIndex].back : sessionCards[reviewIndex].front}
            </div>
            {isFlipped && sessionCards[reviewIndex].explanation && (
              <p className="text-xs text-stone-500 mt-4 max-w-md italic border-t border-stone-200 pt-3">
                {sessionCards[reviewIndex].explanation}
              </p>
            )}
          </div>

          {/* Rating Buttons */}
          {isFlipped ? (
            <div className="space-y-3">
              <div className="text-center text-xs font-semibold text-stone-500">
                Rate your recall difficulty:
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRateCard('again')}
                  className="py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition cursor-pointer"
                >
                  Again (1d)
                </button>
                <button
                  type="button"
                  onClick={() => handleRateCard('hard')}
                  className="py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition cursor-pointer"
                >
                  Hard
                </button>
                <button
                  type="button"
                  onClick={() => handleRateCard('good')}
                  className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition cursor-pointer"
                >
                  Good
                </button>
                <button
                  type="button"
                  onClick={() => handleRateCard('easy')}
                  className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer"
                >
                  Easy (Bonus)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition"
              >
                <RotateCw size={14} />
                <span>Show Answer</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Deck / Cards Layout */}
      {!isReviewing && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Deck List (Left) */}
          <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
              Your Decks ({decks.length})
            </h3>
            <div className="space-y-2">
              {decks.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400">
                  No decks yet. Click "New Deck" to start.
                </div>
              ) : (
                decks.map((d) => {
                  const deckCardCount = cards.filter((c) => c.deckId === d.id).length;
                  const isSelected = d.id === activeDeckId;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setActiveDeckId(d.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/40'
                          : 'border-stone-200 hover:border-purple-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-stone-900">{d.title}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {deckCardCount} cards
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this deck and all cards?')) {
                            onDeleteDeck(d.id);
                          }
                        }}
                        className="p-1 text-stone-300 hover:text-red-600 rounded cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Deck View (Right) */}
          <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            {activeDeck ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">{activeDeck.title}</h2>
                    <p className="text-xs text-stone-500 mt-0.5">{activeDeck.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCardModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Card</span>
                    </button>

                    <button
                      type="button"
                      disabled={dueCardsInActiveDeck.length === 0}
                      onClick={() => startReviewSession(false)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-40 shadow-xs"
                    >
                      <Play size={14} />
                      <span>Review Due ({dueCardsInActiveDeck.length})</span>
                    </button>

                    <button
                      type="button"
                      disabled={activeDeckCards.length === 0}
                      onClick={() => startReviewSession(true)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer disabled:opacity-40"
                    >
                      Practice All ({activeDeckCards.length})
                    </button>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Cards in Deck ({activeDeckCards.length})
                  </div>

                  {activeDeckCards.length === 0 ? (
                    <div className="text-center py-12 text-xs text-stone-400">
                      No cards in this deck yet. Add cards with question & answer prompts.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeDeckCards.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 rounded-xl border border-stone-200 bg-stone-50/40 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="font-bold text-xs text-stone-900 mb-1">{c.front}</div>
                            <div className="text-xs text-stone-600 line-clamp-2">{c.back}</div>
                          </div>
                          <div className="flex items-center justify-between border-t border-stone-200/60 pt-2 text-[10px] text-stone-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              <span>
                                Next: {new Date(c.schedule.nextReviewAt).toLocaleDateString()}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => onDeleteCard(c.id)}
                              className="text-stone-300 hover:text-red-600 cursor-pointer p-0.5"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-stone-400 text-xs">
                Select or create a deck to manage flashcards.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: New Deck */}
      {isDeckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Create Flashcard Deck</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Deck Title</label>
              <input
                type="text"
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                placeholder="e.g. Excel Formula Mastery"
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Description</label>
              <textarea
                value={newDeckDesc}
                onChange={(e) => setNewDeckDesc(e.target.value)}
                placeholder="Key concepts, function syntaxes, and keyboard shortcuts..."
                rows={2}
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Link to Course (Optional)
              </label>
              <select
                value={newDeckClassId}
                onChange={(e) => setNewDeckClassId(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
              >
                <option value="">None (Independent Deck)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeckModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateDeck}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
              >
                Create Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Card */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">Add New Card to Deck</h3>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Front (Prompt / Question)
              </label>
              <textarea
                value={cardFront}
                onChange={(e) => setCardFront(e.target.value)}
                placeholder="What does VLOOKUP stand for and what is its first argument?"
                rows={2}
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Back (Answer)
              </label>
              <textarea
                value={cardBack}
                onChange={(e) => setCardBack(e.target.value)}
                placeholder="Vertical Lookup. The first argument is lookup_value (the key to search for)."
                rows={3}
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Extra Explanation / Note (Optional)
              </label>
              <input
                type="text"
                value={cardExplanation}
                onChange={(e) => setCardExplanation(e.target.value)}
                placeholder="lookup_value must reside in the first column of table_array."
                className="w-full p-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCard}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
