import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PronunciationPage from './page'; // Adjust import path
import * as aiFlow from '@/ai/flows/pronunciation-feedback'; // Import the module to mock
import { useToast } from "@/hooks/use-toast"; // Import useToast

// Mock the AI flow
jest.mock('@/ai/flows/pronunciation-feedback', () => ({
  getPronunciationFeedback: jest.fn(),
}));

// Mock the useToast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock Math.random for deterministic phrase selection
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5; // Always return 0.5 for predictability
global.Math = mockMath;

describe('PronunciationPage', () => {
  const mockGetPronunciationFeedback = aiFlow.getPronunciationFeedback as jest.Mock;
  const mockToast = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockGetPronunciationFeedback.mockClear();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    mockToast.mockClear();

    // Reset MediaRecorder mocks specifically for ondataavailable and onstop
    const mockMediaRecorderInstance = {
        start: jest.fn(),
        stop: jest.fn(() => {
           // Simulate onstop being called immediately after stop
           mockMediaRecorderInstance.onstop?.();
        }),
        ondataavailable: jest.fn((event: { data: Blob }) => {
           // Simulate data becoming available
           const blob = new Blob(['mock audio chunk'], { type: 'audio/webm' });
            if (mockMediaRecorderInstance.ondataavailable) {
                mockMediaRecorderInstance.ondataavailable({ data: blob });
            }
        }),
        onerror: jest.fn(),
        onstop: jest.fn(), // This will be set by the component
        state: '',
        mimeType: 'audio/webm', // Ensure mimeType is set
         addEventListener: jest.fn(),
         removeEventListener: jest.fn(),
         dispatchEvent: jest.fn(),
         pause: jest.fn(),
         resume: jest.fn(),
         requestData: jest.fn(),
         onpause: jest.fn(),
         onresume: jest.fn(),
         onstart: jest.fn(),
         isTypeSupported: jest.fn(() => true),
         stream: {
           getTracks: jest.fn(() => [{
             stop: jest.fn()
           }])
         }
    };
    (global.MediaRecorder as jest.Mock).mockImplementation(() => mockMediaRecorderInstance);
    (global.navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue({
        getTracks: jest.fn(() => [{ stop: jest.fn() }])
    });

     // Mock FileReader
     global.FileReader = jest.fn().mockImplementation(() => ({
       readAsDataURL: jest.fn(function(this: any, blob: Blob) {
         // Simulate async reading
         setTimeout(() => {
           this.onloadend?.({ target: { result: `data:${blob.type || 'audio/webm'};base64,bW9ja2F1ZGlv` } }); // mock base64 data
         }, 0);
       }),
       onloadend: null,
       onerror: null,
       result: null,
     })) as any;

     // Mock URL.createObjectURL
     global.URL.createObjectURL = jest.fn(() => 'blob:mockurl/12345');
     global.URL.revokeObjectURL = jest.fn();
  });


   it('renders the initial state correctly with a random phrase', () => {
     render(<PronunciationPage />);
     // Phrase depends on Math.random mock (0.5 should pick the middle one)
     expect(screen.getByText('Can I have a glass of water?')).toBeInTheDocument();
     expect(screen.getByRole('button', { name: /Record/i })).toBeInTheDocument();
     expect(screen.queryByRole('button', { name: /Stop/i })).not.toBeInTheDocument();
     expect(screen.queryByRole('button', { name: /Get Feedback/i })).not.toBeInTheDocument();
     expect(screen.queryByRole('alert')).not.toBeInTheDocument();
   });

   it('starts recording when "Record" button is clicked', async () => {
    render(<PronunciationPage />);
    const recordButton = screen.getByRole('button', { name: /Record/i });
    await act(async () => {
        fireEvent.click(recordButton);
    });

    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    // Check if MediaRecorder was instantiated and started
    await waitFor(() => {
       expect(global.MediaRecorder).toHaveBeenCalled();
       const mockRecorderInstance = (global.MediaRecorder as jest.Mock).mock.results[0].value;
       expect(mockRecorderInstance.start).toHaveBeenCalled();
       expect(screen.getByRole('button', { name: /Stop/i })).toBeInTheDocument();
       expect(screen.queryByRole('button', { name: /Record/i })).not.toBeInTheDocument();
    });
   });

   it('stops recording when "Stop" button is clicked and shows audio player', async () => {
     render(<PronunciationPage />);
     const recordButton = screen.getByRole('button', { name: /Record/i });
     await act(async () => {
        fireEvent.click(recordButton);
     });

     // Wait for recording to start
     const stopButton = await screen.findByRole('button', { name: /Stop/i });

     // Get the mock recorder instance
     const mockRecorderInstance = (global.MediaRecorder as jest.Mock).mock.results[0].value;
     mockRecorderInstance.state = 'recording'; // Set state for stop condition check

     // Mock the ondataavailable and onstop behavior
     await act(async () => {
        fireEvent.click(stopButton);
        // Manually trigger ondataavailable and onstop as they might not fire automatically in test env
         const blob = new Blob(['mock audio data'], { type: 'audio/webm' });
         if(mockRecorderInstance.ondataavailable) {
             mockRecorderInstance.ondataavailable({ data: blob });
         }
        mockRecorderInstance.onstop(); // Trigger onstop logic
     });

     // Check if stop was called
      await waitFor(() => {
          expect(mockRecorderInstance.stop).toHaveBeenCalled();
      });

     await waitFor(() => {
        // Check for elements that appear after stopping
        expect(screen.getByText(/Recording complete. Ready for feedback./i)).toBeInTheDocument();
        expect(screen.getByRole('audio')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Get Feedback/i })).toBeInTheDocument();
        // Check if record button is back
        expect(screen.getByRole('button', { name: /Record/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Stop/i })).not.toBeInTheDocument();
     });
   });


    it('calls the AI flow and displays feedback when "Get Feedback" is clicked', async () => {
      mockGetPronunciationFeedback.mockResolvedValue({ feedback: 'Good job!' });
      render(<PronunciationPage />);

      // Simulate recording and stopping
      const recordButton = screen.getByRole('button', { name: /Record/i });
       await act(async () => {
           fireEvent.click(recordButton);
       });
      const stopButton = await screen.findByRole('button', { name: /Stop/i });
       await act(async () => {
            const mockRecorderInstance = (global.MediaRecorder as jest.Mock).mock.results[0].value;
            mockRecorderInstance.state = 'recording';
            const blob = new Blob(['mock audio data'], { type: 'audio/webm' });
            // Manually trigger events for state update
             if(mockRecorderInstance.ondataavailable) {
                 mockRecorderInstance.ondataavailable({ data: blob });
             }
            fireEvent.click(stopButton); // This should trigger the instance's stop()
            mockRecorderInstance.onstop(); // Manually ensure onstop runs
       });


      // Wait for the Get Feedback button to appear
      const feedbackButton = await screen.findByRole('button', { name: /Get Feedback/i });

       await act(async () => {
           fireEvent.click(feedbackButton);
       });

      // Check loading state
      expect(screen.getByRole('button', { name: /Analyzing.../i })).toBeDisabled();

      await waitFor(() => {
        expect(mockGetPronunciationFeedback).toHaveBeenCalledWith({
          audioDataUri: 'data:audio/webm;base64,bW9ja2F1ZGlv', // From mock FileReader
          text: 'Can I have a glass of water?', // From mock Math.random
        });
      });

       await waitFor(() => {
          expect(screen.getByText('Pronunciation Feedback')).toBeInTheDocument();
          expect(screen.getByText('Good job!')).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /Get Feedback/i })).toBeEnabled(); // Re-enabled
          expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
             title: "Feedback Received",
             variant: "default",
          }));
       });
    });


     it('displays an error message if AI flow fails', async () => {
       const error = new Error('AI analysis failed');
       mockGetPronunciationFeedback.mockRejectedValue(error);
       render(<PronunciationPage />);

       // Simulate recording and stopping
       const recordButton = screen.getByRole('button', { name: /Record/i });
       await act(async () => { fireEvent.click(recordButton); });
       const stopButton = await screen.findByRole('button', { name: /Stop/i });
        await act(async () => {
            const mockRecorderInstance = (global.MediaRecorder as jest.Mock).mock.results[0].value;
             mockRecorderInstance.state = 'recording';
             const blob = new Blob(['mock audio data'], { type: 'audio/webm' });
              if(mockRecorderInstance.ondataavailable) {
                  mockRecorderInstance.ondataavailable({ data: blob });
              }
            fireEvent.click(stopButton);
             mockRecorderInstance.onstop();
        });

       const feedbackButton = await screen.findByRole('button', { name: /Get Feedback/i });
        await act(async () => {
            fireEvent.click(feedbackButton);
        });


        await waitFor(() => {
           expect(mockGetPronunciationFeedback).toHaveBeenCalled();
           expect(screen.getByRole('alert')).toBeInTheDocument();
           expect(screen.getByText('Error')).toBeInTheDocument();
           // Check the specific error message related to AI failure
           expect(screen.getByText(/Failed to get pronunciation feedback: AI analysis failed/i)).toBeInTheDocument();
           expect(screen.getByRole('button', { name: /Get Feedback/i })).toBeEnabled(); // Re-enabled
           expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
               title: "Feedback Error",
               variant: "destructive",
               description: expect.stringContaining("Failed to get pronunciation feedback: AI analysis failed"),
           }));
       });
     });

    it('selects a new phrase when "New Phrase" button is clicked', async () => {
      render(<PronunciationPage />);
      const initialPhrase = screen.getByText('Can I have a glass of water?');
      expect(initialPhrase).toBeInTheDocument();

      const newPhraseButton = screen.getByRole('button', { name: /New Phrase/i });

      // Change the mock random value for the next call
      mockMath.random = () => 0.1;

       await act(async () => {
            fireEvent.click(newPhraseButton);
       });


      await waitFor(() => {
        // Based on new Math.random value (0.1 should pick the first phrase)
        const newPhrase = screen.getByText('Hello, how are you?');
        expect(newPhrase).toBeInTheDocument();
        expect(initialPhrase).not.toBeInTheDocument();
        // Also ensure state related to previous recording/feedback is reset
        expect(screen.queryByRole('audio')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Get Feedback/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });

       // Reset Math.random mock
       mockMath.random = () => 0.5;
    });

    it('handles microphone permission denied error (NotAllowedError)', async () => {
      const error = new Error("Permission denied");
      error.name = 'NotAllowedError'; // Simulate permission denied specifically
      (global.navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(error);

      render(<PronunciationPage />);
      const recordButton = screen.getByRole('button', { name: /Record/i });

      await act(async () => {
         fireEvent.click(recordButton);
      });

      await waitFor(() => {
          expect(screen.getByRole('alert')).toBeInTheDocument();
          expect(screen.getByText('Error')).toBeInTheDocument();
          // Check for the specific permission denied message
          expect(screen.getByText(/Microphone permission denied. Please grant permission/i)).toBeInTheDocument();
          expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
             title: "Microphone Error",
             variant: "destructive",
             description: expect.stringContaining("Microphone permission denied."),
          }));
      });
  });

  it('handles microphone not found error (NotFoundError)', async () => {
      const error = new Error("Requested device not found");
      error.name = 'NotFoundError'; // Simulate no device found
      (global.navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(error);

      render(<PronunciationPage />);
      const recordButton = screen.getByRole('button', { name: /Record/i });

      await act(async () => {
         fireEvent.click(recordButton);
      });

      await waitFor(() => {
          expect(screen.getByRole('alert')).toBeInTheDocument();
          expect(screen.getByText('Error')).toBeInTheDocument();
          // Check for the specific not found message
          expect(screen.getByText(/No microphone found. Please ensure a microphone is connected/i)).toBeInTheDocument();
          expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
             title: "Microphone Error",
             variant: "destructive",
             description: expect.stringContaining("No microphone found."),
          }));
      });
  });

  it('handles generic microphone access error', async () => {
      const error = new Error("Something else went wrong");
      error.name = 'UnknownError'; // Simulate a generic error
      (global.navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(error);

      render(<PronunciationPage />);
      const recordButton = screen.getByRole('button', { name: /Record/i });

      await act(async () => {
         fireEvent.click(recordButton);
      });

      await waitFor(() => {
          expect(screen.getByRole('alert')).toBeInTheDocument();
          expect(screen.getByText('Error')).toBeInTheDocument();
          // Check for the generic error message including the specific error text
          expect(screen.getByText(/Could not access microphone. Error: Something else went wrong/i)).toBeInTheDocument();
          expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
             title: "Microphone Error",
             variant: "destructive",
             description: expect.stringContaining("Could not access microphone. Error: Something else went wrong"),
          }));
      });
  });


});