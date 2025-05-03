import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, BrainCircuit, Mic } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to LinguaLeap!</h1>
        <p className="text-lg text-muted-foreground">Your journey to language mastery starts here.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Interactive Vocab Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <BookOpenText className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-center text-2xl">Interactive Vocabulary</CardTitle>
            <CardDescription className="text-center">
              Learn new words with visual aids and audio pronunciation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
            <Link href="/vocabulary" passHref className='mt-auto'>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Start Learning Vocab
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Adaptive Quizzes Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader>
             <div className="flex items-center justify-center mb-4">
               <BrainCircuit className="h-12 w-12 text-accent" />
             </div>
            <CardTitle className="text-center text-2xl">Adaptive Quizzes</CardTitle>
            <CardDescription className="text-center">
              Reinforce your learning with spaced repetition quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
             <Link href="/quizzes" passHref className='mt-auto'>
               <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Take a Quiz
               </Button>
             </Link>
          </CardContent>
        </Card>

        {/* AI Pronunciation Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Mic className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-center text-2xl">AI Pronunciation Tool</CardTitle>
            <CardDescription className="text-center">
              Get instant feedback on your pronunciation from our AI tutor.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
             <Link href="/pronunciation" passHref className='mt-auto'>
               <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Practice Pronunciation
               </Button>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
