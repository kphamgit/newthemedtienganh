import React, { useEffect, useImperativeHandle, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChildRef } from '../TakeQuiz';

// 1. Data Structure Definitions
type WordBankItem = {
  id: string; // Unique ID for Framer Motion to track
  text: string;
};

type SentenceToken = 
  | { type: 'text'; content: string }
  | { type: 'blank'; blankIndex: number };

interface Props {
  content: string | undefined;
  choices?: string; // string of options separated by slash, e.g. "is/fun/great/challenging"
  ref: React.Ref<ChildRef>;
}
// 3. Animation Settings (Shared Layout is key)
// We need a wrapper to give the shared layout a scope.
export const ButtonSelectCloze = ({ content, choices, ref }: Props) => {
  // State: Words remaining in the bank below
  //const [wordBank, setWordBank] = useState<WordBankItem[]>(initialWordBank);
  const [initialSentence, setInitialSentence] = useState<SentenceToken[]>([]);
  const [wordBank, setWordBank] = useState<WordBankItem[]>([]);
  const [longestWord, setLongestWord] = useState<string>("");

  const [answer, setAnswer] = useState<string[] | undefined>(undefined);

  const [placedWords, setPlacedWords] = useState<Record<number, WordBankItem | null>>({});

  // Handle clicking a word from the bank
  const handleWordSelect = (selectedItem: WordBankItem) => {
    // 1. Find the first empty blank
    const targetBlankIndex = [0, 1].find(index => placedWords[index] === null);

    // If no blanks are empty, ignore the click
    if (targetBlankIndex === undefined) return;

    const audioUrl =`https://kphamazureblobstore.blob.core.windows.net/tts-audio/${selectedItem.text}.mp3`;
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
        console.error("Error playing audio:", error);
    });

    // 2. Update States
    setPlacedWords(prev => ({
      ...prev,
      [targetBlankIndex]: selectedItem,
    }));

    setWordBank(prev => prev.filter(item => item.id !== selectedItem.id));
    // add selected word to answer state
    setAnswer(prev => {
      const newAnswer = [...(prev || [])];
      newAnswer[targetBlankIndex] = selectedItem.text;
      return newAnswer;
    });
  };

  const getAnswer = () => {
    return answer?.join('/');
  }

  useImperativeHandle(ref, () => ({
    getAnswer,
  }));

  useEffect(() => {
    if (!choices) return;
    setAnswer(undefined);
    setPlacedWords({});

    const regex0 = /\[(.*?)\]/g;
    //console.log("question_content = ", questionContent)
    const matches = content?.match(regex0);
    // kpham: save the choices prop in a variable, add the matches to it, and assign the
    // the result to allChoices, which will be used to create the word bank. 
    // don't try to modify the choices prop directly because it will cause an infinite loop of re-rendering 
    // and useEffect calls since choices is a dependency of this useEffect.
    let allChoices = choices;
    if (matches && matches.length > 0) {
        matches.forEach((match_with_brackets) => {
          const match_text = match_with_brackets.replace(/[\[\]]/g, '');
          allChoices = allChoices + '/' + match_text;
        })
    }
    console.log("ButtonSelectCloze: content =", content, " choices = ", allChoices);


    const parsedChoices = allChoices.split('/').map(choice => choice.trim());
    const wordBankItems = parsedChoices.map((choice, index) => ({
      id: `${content?.slice(0, 20)}_opt${index + 1}`,
      text: choice,
    }));
    setWordBank(wordBankItems);
    const longest_word = wordBankItems.reduce((a, b) => 
      a.text.length > b.text.length ? a : b
    ).text;
    setLongestWord(longest_word);
    //console.log("ButtonSelectCloze: content =", content, " choices = ", choices, " parsedChoices = ", parsedChoices, " wordBankItems = ", wordBankItems);
    //It's [illegal] to drive on the left side of the road.
    const sentenceTokens: SentenceToken[] = [];
    // We can use a regex to split the content into text and blanks using square brackets as delimiters
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;
    let blankIndex = 0;
    if (!content) return;
    while ((match = regex.exec(content)) !== null) {
      // Add text before the blank
      if (match.index > lastIndex) {
        sentenceTokens.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      // Add the blank token
      sentenceTokens.push({ type: 'blank', blankIndex });
      blankIndex++;
      lastIndex = regex.lastIndex;
    }
    // Add any remaining text after the last blank
    if (lastIndex < content.length) {
      sentenceTokens.push({ type: 'text', content: content.slice(lastIndex) });
    }
    setInitialSentence(sentenceTokens);
     // setPlacedWords to have the correct number of blanks based on the content
    const newPlacedWords: Record<number, WordBankItem | null> = {};
    for (let i = 0; i < blankIndex; i++) {
      newPlacedWords[i] = null;
    }
    setPlacedWords(newPlacedWords);

  }, [choices, content]);

  return (
    // 'LayoutGroup' scope allows layoutId to work across components
    <div className="p-8 space-y-10 bg-white rounded-xl shadow-lg border border-gray-500 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 text-center">Complete the Sentence</h2>

      {/* --- The Sentence Area --- */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-lg font-medium text-red-600 leading-relaxed min-h-16">
        {initialSentence.map((token, index) => {
          if (token.type === 'text') {
            return <span key={index}>{token.content}</span>;
          }

          // If it's a blank, display the box, potentially filled
          const placedWord = placedWords[token.blankIndex];

          return (
            <div 
              key={`blank-${token.blankIndex}`} 
              className="relative border-b-2 border-gray-300 min-w-[120px] h-10 flex items-center justify-center bg-gray-100 rounded"
            >
              {/* 1. THE GHOST: This invisible text forced the box to the correct width */}
  <span className="opacity-0 select-none pointer-events-none whitespace-nowrap px-2">
    {longestWord}
  </span>
              {/* This is where the magic happens */}
              {/* 2. THE ACTUAL CONTENT: */}
              <AnimatePresence>
                {placedWord && (
                  <motion.div
                    //ACTUAL CONTENT.CRITICAL: layoutId must match the bank item for shared layout to work 
                    layoutId={placedWord.id} 
                    className="absolute inset-0 px-4 flex items-center justify-center bg-blue-100 text-blue-800 rounded shadow-inner cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    // Handle removing the word back to the bank (bonus feature)
                    onClick={() => {
                        setPlacedWords(prev => ({...prev, [token.blankIndex]: null}));
                        setWordBank(prev => [...prev, placedWord]);
                    }}
                  >
                    {placedWord.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* --- The Word Bank Area --- */}
      <div className="pt-8 border-t border-gray-100">
       
        <div className="flex flex-wrap gap-4 min-h-14 items-center">
          <AnimatePresence initial={false}>
            {wordBank.map((item) => (
              <motion.button
                key={item.id}
                // CRITICAL: layoutId must match the filled word!
                layoutId={item.id} 
                onClick={() => handleWordSelect(item)}
                className="px-6 py-3 text-lg font-semibold bg-green-300 text-gray-800 rounded-md shadow hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              >
                {item.text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};