// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables if needed
// process.env.GOOGLE_GENAI_API_KEY = 'test-key';

// Mock MediaRecorder and related APIs for pronunciation tests
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: jest.fn(),
  onerror: jest.fn(),
  state: '',
  mimeType: '',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  requestData: jest.fn(),
  onpause: jest.fn(),
  onresume: jest.fn(),
  onstart: jest.fn(),
  onstop: jest.fn(),
  isTypeSupported: jest.fn(() => true),
  stream: {
    getTracks: jest.fn(() => [{
      stop: jest.fn()
    }])
  }
}));

global.navigator.mediaDevices = {
  ...global.navigator.mediaDevices,
  getUserMedia: jest.fn().mockResolvedValue({
     getTracks: jest.fn(() => [{
        stop: jest.fn()
      }])
  }),
};

global.URL.createObjectURL = jest.fn(() => 'blob:mockurl');
global.URL.revokeObjectURL = jest.fn();

global.FileReader = jest.fn().mockImplementation(() => ({
  readAsDataURL: jest.fn(function(blob) {
    this.onloadend?.({ target: { result: 'data:audio/webm;base64,mockaudio=' } });
  }),
  onloadend: null,
  onerror: null,
  result: null,
})) as any;


// Mock matchMedia used by useIsMobile hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
