'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from 'lucide-react';

// Mock quiz data - replace with dynamic data and spaced repetition logic
const quizItems = [
  { id: 1, question: 'What is the Spanish word for "Apple"?', options: ['Libro', 'Manzana', 'Casa', 'Perro'], answer: 'Manzana', hint: 'fruit red' },
  { id: 2, question: 'What is the Spanish word for "Book"?', options: ['Manzana', 'Libro', 'Coche', 'Casa'], answer: 'Libro', hint: 'reading knowledge' },
  { id: 3, question: 'What is the Spanish word for "House"?', options: ['Perro', 'Coche', 'Casa', 'Libro'], answer: 'Casa', hint: 'building home' },
  { id: 4, question: 'What is the Spanish word for "Dog"?', options: ['Casa', 'Manzana', 'Perro', 'Coche'], answer: 'Perro', hint: 'animal pet' },
  { id: 5, question: 'What is the Spanish word for "Car"?', options: ['Libro', 'Perro', 'Manzana', 'Coche'], answer: 'Coche', hint: 'vehicle transport' },
];

type QuizStatus = 'idle' | 'correct' | 'incorrect';

export default function QuizzesPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);

   useEffect(() => {
     setProgress(((currentIndex) / quizItems.length) * 100);
   }, [currentIndex]);

  const currentQuestion = quizItems[currentIndex];

  const handleSelectOption = (value: string) => {
    if (status === 'idle') {
      setSelectedOption(value);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption) return;

    if (selectedOption === currentQuestion.answer) {
      setStatus('correct');
      setScore((prevScore) => prevScore + 1);
    } else {
      setStatus('incorrect');
    }
  };

  const handleNext = () => {
    setStatus('idle');
    setSelectedOption(null);
    if (currentIndex < quizItems.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else {
      // End of quiz
      setShowResults(true);
      setProgress(100);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setStatus('idle');
    setScore(0);
    setShowResults(false);
    setProgress(0);
  };

  if (showResults) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-theme(spacing.14))]">
        <Card className="w-full max-w-md shadow-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-primary">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-xl">Your Score: <span className="font-bold">{score} / {quizItems.length}</span></p>
             <Progress value={(score / quizItems.length) * 100} className="w-full" />
             <p className="text-muted-foreground">{score === quizItems.length ? "Perfect! 🎉" : score > quizItems.length / 2 ? "Great job! 👍" : "Keep practicing! 💪"}</p>
          </CardContent>
          <CardFooter>
             <Button onClick={resetQuiz} className="w-full">Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-theme(spacing.14))]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-2xl font-semibold">Question {currentIndex + 1}/{quizItems.length}</CardTitle>
          <CardDescription className="text-lg pt-2">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={selectedOption ?? undefined}
            onValueChange={handleSelectOption}
            disabled={status !== 'idle'}
          >
            {currentQuestion.options.map((option) => (
              <div key={option} className={`flex items-center space-x-2 p-3 rounded-md border transition-colors ${
                status !== 'idle' && option === currentQuestion.answer ? 'border-success bg-success/10' : ''
               } ${
                 status === 'incorrect' && option === selectedOption ? 'border-destructive bg-destructive/10' : ''
               } ${status === 'idle' ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-not-allowed'}`}>
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className={`flex-1 ${status !== 'idle' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  {option}
                </Label>
                 {status !== 'idle' && option === currentQuestion.answer && <CheckCircle className="h-5 w-5 text-success" />}
                 {status === 'incorrect' && option === selectedOption && <XCircle className="h-5 w-5 text-destructive" />}
              </div>
            ))}
          </RadioGroup>

          {status === 'correct' && (
            <p className="text-success flex items-center"><CheckCircle className="mr-2 h-5 w-5" /> Correct!</p>
          )}
          {status === 'incorrect' && (
            <p className="text-destructive flex items-center"><XCircle className="mr-2 h-5 w-5" /> Incorrect. The answer is: <span className="font-semibold ml-1">{currentQuestion.answer}</span></p>
          )}

        </CardContent>
        <CardFooter>
          {status === 'idle' ? (
            <Button onClick={handleSubmit} disabled={!selectedOption} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Submit</Button>
          ) : (
            <Button onClick={handleNext} className="w-full">Next Question</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

