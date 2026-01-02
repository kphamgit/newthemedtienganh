const WordScrambleExplanation = ({ scrambledWords }: { scrambledWords: string[] }) => {
    return (
      <ul>
        {scrambledWords.map((word, index) => (
          <li key={index}>{word}</li>
        ))}
      </ul>
    );
  };

  export default WordScrambleExplanation;