import '@testing-library/jest-dom'

// Polyfill fetch for jsdom test environment
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response))
