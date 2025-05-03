'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Loader2, CheckCircle, MessageSquareWarning } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPronunciationFeedback, PronunciationFeedbackOutput } from '@/ai/flows/pronunciation-feedback'; // Import GenAI flow
import { useToast } from "@/hooks/use-toast";

const PHRASES_TO_PRACTICE = [
    "Hello, how are you?",
    "Where is the library?",
    "Can I have a glass of water?",
    "The quick brown fox jumps over the lazy dog.",
    "She sells seashells by the seashore."
];

export default function PronunciationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [feedback, setFeedback] = useState<PronunciationFeedbackOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

   useEffect(() => {
     // Select a random phrase on component mount
     selectRandomPhrase();
   }, []);

   const selectRandomPhrase = () => {
     const randomIndex = Math.floor(Math.random() * PHRASES_TO_PRACTICE.length);
     setCurrentPhrase(PHRASES_TO_PRACTICE[randomIndex]);
     // Reset state when phrase changes
     setAudioBlob(null);
     setFeedback(null);
     setError(null);
     setIsLoading(false);
     if (isRecording) {
       stopRecording();
     }
   };


  const startRecording = async () => {
    setError(null);
    setFeedback(null);
    setAudioBlob(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // Specify mimeType if possible
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Use consistent type
          setAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop()); // Stop the microphone access track
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        console.error("Error accessing microphone:", err);
        let userErrorMessage = "Could not access microphone.";
        if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
            userErrorMessage = "Microphone permission denied. Please grant permission in your browser settings and refresh the page.";
        } else if (err.name === 'NotFoundError') {
            userErrorMessage = "No microphone found. Please ensure a microphone is connected and enabled.";
        } else {
            userErrorMessage = `Could not access microphone. Error: ${err.message || 'Unknown error'}`;
        }
        setError(userErrorMessage);
        toast({
            variant: "destructive",
            title: "Microphone Error",
            description: userErrorMessage,
        });
      }
    } else {
      const unsupportedMessage = "Audio recording is not supported in this browser.";
      setError(unsupportedMessage);
       toast({
           variant: "destructive",
           title: "Unsupported Browser",
           description: unsupportedMessage,
       });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

 const blobToDataUri = (blob: Blob): Promise<string> => {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            // Ensure the MIME type is included if not already present
            if (reader.result.startsWith('data:')) {
               resolve(reader.result);
            } else {
                // Add the correct MIME type from the blob
               resolve(`data:${blob.type || 'application/octet-stream'};base64,${reader.result.split(',')[1]}`);
            }
        } else {
           reject(new Error('Failed to convert blob to string'));
        }
     };
     reader.onerror = reject;
     reader.readAsDataURL(blob);
   });
 };


  const handleGetFeedback = async () => {
    if (!audioBlob || !currentPhrase) return;

    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
        // Ensure audioBlob has data before proceeding
        if (audioBlob.size === 0) {
           throw new Error("Recorded audio is empty. Please try recording again.");
        }

        const audioDataUri = await blobToDataUri(audioBlob);
        console.log("Audio Data URI length:", audioDataUri.length); // Log length for debugging

        // Basic check if it seems like a data URI and has audio MIME type
         if (!audioDataUri.startsWith('data:audio/')) {
            throw new Error(`Generated data URI is not in the expected audio format. Found: ${audioDataUri.substring(0, 30)}...`);
         }

         const result = await getPronunciationFeedback({
             audioDataUri: audioDataUri,
             text: currentPhrase,
         });
         setFeedback(result);
         toast({
            title: "Feedback Received",
            description: "AI has analyzed your pronunciation.",
            variant: "default",
          });

    } catch (err: any) {
      console.error("Error getting feedback:", err);
      let errorMessage = "Failed to get pronunciation feedback. Please try again.";
      if (err.message) {
        errorMessage = `Failed to get pronunciation feedback: ${err.message}`;
      }
      setError(errorMessage);
      toast({
         variant: "destructive",
         title: "Feedback Error",
         description: errorMessage,
       });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-start min-h-[calc(100vh-theme(spacing.14))]">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-semibold text-primary">Pronunciation Practice</CardTitle>
          <CardDescription>Record yourself saying the phrase below and get AI feedback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="text-center p-4 border rounded-md bg-muted">
              <p className="text-xl font-medium">{currentPhrase || 'Loading phrase...'}</p>
           </div>

           <div className="flex justify-center space-x-4">
            <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className="w-32 transition-all duration-300 ease-in-out transform hover:scale-105"
                disabled={!currentPhrase} // Disable if no phrase loaded
              >
                {isRecording ? (
                  <>
                    <StopCircle className="mr-2 h-5 w-5 animate-pulse" /> Stop
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" /> Record
                  </>
                )}
              </Button>
             <Button onClick={selectRandomPhrase} variant="outline" size="lg">
               New Phrase
             </Button>
           </div>


          {audioBlob && !isRecording && (
            <div className="text-center space-y-4 pt-4">
               <p className="text-sm text-muted-foreground flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-success"/> Recording complete. Ready for feedback.
                </p>
                {/* Add key to force re-render when audioBlob changes */}
                <audio key={URL.createObjectURL(audioBlob)} controls src={URL.createObjectURL(audioBlob)} className="w-full" />
                 <Button
                   onClick={handleGetFeedback}
                   disabled={isLoading}
                   className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                   size="lg"
                 >
                   {isLoading ? (
                     <>
                       <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                     </>
                   ) : (
                     'Get Feedback'
                   )}
                 </Button>
             </div>
          )}

          {error && (
            <Alert variant="destructive">
              <MessageSquareWarning className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {feedback && !isLoading && (
            <Alert variant="default" className="bg-primary/10 border-primary/30">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Pronunciation Feedback</AlertTitle>
              <AlertDescription>
                <p className="whitespace-pre-wrap">{feedback.feedback}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                Click "Record", speak the phrase clearly, then click "Stop". Finally, click "Get Feedback".
            </p>
         </CardFooter>
      </Card>
    </div>
  );
}
