'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, ArrowLeft, ArrowRight } from 'lucide-react';

// Mock data - replace with actual data fetching
const vocabularyItems = [
  { id: 1, word: 'Apple', translation: 'Manzana', image: 'https://picsum.photos/300/200?random=1', audio: '/audio/apple.mp3', hint: 'fruit red' },
  { id: 2, word: 'Book', translation: 'Libro', image: 'https://picsum.photos/300/200?random=2', audio: '/audio/book.mp3', hint: 'reading knowledge' },
  { id: 3, word: 'House', translation: 'Casa', image: 'https://picsum.photos/300/200?random=3', audio: '/audio/house.mp3', hint: 'building home' },
  { id: 4, word: 'Dog', translation: 'Perro', image: 'https://picsum.photos/300/200?random=4', audio: '/audio/dog.mp3', hint: 'animal pet' },
  { id: 5, word: 'Car', translation: 'Coche', image: 'https://picsum.photos/300/200?random=5', audio: '/audio/car.mp3', hint: 'vehicle transport' },
];

export default function VocabularyPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentItem = vocabularyItems[currentIndex];

  const playAudio = () => {
    // In a real app, you'd use the Web Audio API or a library
    console.log(`Playing audio for: ${currentItem.word}`);
    // Example: const audio = new Audio(currentItem.audio); audio.play();
    alert(`(Audio playback simulation for "${currentItem.word}")`);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % vocabularyItems.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + vocabularyItems.length) % vocabularyItems.length);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-theme(spacing.14))]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-semibold text-primary">{currentItem.word}</CardTitle>
          <p className="text-center text-muted-foreground text-lg">{currentItem.translation}</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
             <Image
               src={currentItem.image}
               alt={currentItem.word}
               layout="fill"
               objectFit="cover"
               data-ai-hint={currentItem.hint}
             />
          </div>
          <Button variant="outline" size="icon" onClick={playAudio} aria-label={`Pronounce ${currentItem.word}`}>
            <Volume2 className="h-6 w-6" />
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between pt-6">
          <Button variant="secondary" onClick={goToPrevious} disabled={vocabularyItems.length <= 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button variant="secondary" onClick={goToNext} disabled={vocabularyItems.length <= 1}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
