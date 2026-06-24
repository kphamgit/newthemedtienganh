import React, { useEffect, useImperativeHandle, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChildRef } from '../TakeQuiz';

type WordBankItem = {
  id: string;
  text: string;
  placed: boolean;
};

type SentenceToken =
  | { type: 'text'; content: string }
  | { type: 'blank'; blankIndex: number };

interface Props {
  content: string | undefined;
  content_language: string;
  choices?: string;
  submitted?: boolean;
  ref: React.Ref<ChildRef>;
}

export const ButtonSelectCloze = ({ content, content_language, choices, submitted = false, ref }: Props) => {
  const [initialSentence, setInitialSentence] = useState<SentenceToken[]>([]);
  const [wordBank, setWordBank] = useState<WordBankItem[]>([]);
  const [longestWord, setLongestWord] = useState<string>("");
  const [answer, setAnswer] = useState<string[] | undefined>(undefined);
  const [placedWords, setPlacedWords] = useState<Record<number, WordBankItem | null>>({});
  const [localSubmitted, setLocalSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) setLocalSubmitted(true);
  }, [submitted]);

  const handleWordSelect = (selectedItem: WordBankItem) => {
    if (selectedItem.placed) return;
    const targetBlankIndex = Object.keys(placedWords).map(Number).find(index => placedWords[index] === null);
    if (targetBlankIndex === undefined) return;

    let audioUrl = `https://kphamazureblobstore.blob.core.windows.net/tts-audio/${selectedItem.text}.mp3`;
    if (content_language === "fr") {
      audioUrl = `https://kphamazureblobstore.blob.core.windows.net/tts-audio/fr_${selectedItem.text}.mp3`;
    }
    const audio = new Audio(audioUrl);
    audio.playbackRate = 0.85; // 1 = normal, < 1 = slower, > 1 = faster
    audio.play().catch(() => {});

    setPlacedWords(prev => ({ ...prev, [targetBlankIndex]: selectedItem }));
    setWordBank(prev => prev.map(item => item.id === selectedItem.id ? { ...item, placed: true } : item));
    setAnswer(prev => {
      const newAnswer = [...(prev || [])];
      newAnswer[targetBlankIndex] = selectedItem.text;
      return newAnswer;
    });
  };

  const handleReturnWord = (blankIndex: number, placedWord: WordBankItem) => {
    setPlacedWords(prev => ({ ...prev, [blankIndex]: null }));
    setWordBank(prev => prev.map(item => item.id === placedWord.id ? { ...item, placed: false } : item));
    setAnswer(prev => {
      if (!prev) return prev;
      const newAnswer = [...prev];
      newAnswer[blankIndex] = '';
      return newAnswer;
    });
  };

  const getAnswer = () => answer?.join('/');

  useImperativeHandle(ref, () => ({ getAnswer }));

  useEffect(() => {
    if (!choices) return;
    setLocalSubmitted(false);
    setAnswer(undefined);
    setPlacedWords({});

    const parsedChoices = choices.split('/').map(choice => choice.trim());
    const wordBankItems: WordBankItem[] = parsedChoices.map((choice, index) => ({
      id: `${content?.slice(0, 20)}_opt${index + 1}`,
      text: choice,
      placed: false,
    }));
    setWordBank(wordBankItems);
    setLongestWord(wordBankItems.reduce((a, b) => a.text.length > b.text.length ? a : b).text);

    const sentenceTokens: SentenceToken[] = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;
    let blankIndex = 0;
    if (!content) return;
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        sentenceTokens.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      sentenceTokens.push({ type: 'blank', blankIndex });
      blankIndex++;
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) {
      sentenceTokens.push({ type: 'text', content: content.slice(lastIndex) });
    }
    setInitialSentence(sentenceTokens);

    const newPlacedWords: Record<number, WordBankItem | null> = {};
    for (let i = 0; i < blankIndex; i++) newPlacedWords[i] = null;
    setPlacedWords(newPlacedWords);
  }, [choices, content]);

  return (
    <div className="p-8 space-y-10 bg-white rounded-xl shadow-lg border border-gray-500 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 text-center">Complete the Sentence</h2>

      {/* Sentence Area */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-lg font-medium text-red-600 leading-relaxed min-h-16">
        {initialSentence.map((token, index) => {
          if (token.type === 'text') {
            return <span key={index}>{token.content}</span>;
          }

          const placedWord = placedWords[token.blankIndex];

          return (
            <div
              key={`blank-${token.blankIndex}`}
              className="relative border-b-2 border-gray-300 min-w-[120px] h-10 flex items-center justify-center bg-gray-100 rounded"
            >
              {/* Ghost to hold width */}
              <span className="opacity-0 select-none pointer-events-none whitespace-nowrap px-2">
                {longestWord}
              </span>
              <AnimatePresence>
                {placedWord && (
                  localSubmitted ? (
                    <span className="absolute inset-0 px-4 flex items-center justify-center font-semibold text-blue-800">
                      {placedWord.text}
                    </span>
                  ) : (
                    <motion.div
                      layoutId={placedWord.id}
                      className="absolute inset-0 px-4 flex items-center justify-center bg-blue-100 text-blue-800 rounded shadow-inner cursor-pointer"
                      whileHover={{ scale: 1.03 }}
                      onClick={() => handleReturnWord(token.blankIndex, placedWord)}
                    >
                      {placedWord.text}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Word Bank Area */}
      <div className="pt-8 border-t border-gray-100">
        <div className="flex flex-wrap gap-4 min-h-14 items-center">
          {wordBank.map((item) =>
            item.placed ? (
              // Ghost placeholder — holds space, low opacity, no layoutId
              <div
                key={item.id}
                className="px-6 py-3 text-lg font-semibold bg-green-300 text-gray-800 rounded-md shadow opacity-30 select-none"
              >
                {item.text}
              </div>
            ) : (
              // Active chip with layoutId for shared layout animation
              <motion.button
                key={item.id}
                layoutId={item.id}
                onClick={() => handleWordSelect(item)}
                className="px-6 py-3 text-lg font-semibold bg-green-300 text-gray-800 rounded-md shadow hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {item.text}
              </motion.button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
