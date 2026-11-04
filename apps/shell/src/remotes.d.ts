// Federated modules are resolved at runtime from each remote's remoteEntry.js,
// so TypeScript needs these declarations to type the dynamic imports.
declare module 'accounts/App' {
  const App: import('react').ComponentType;
  export default App;
}

declare module 'cards/App' {
  const App: import('react').ComponentType;
  export default App;
}

declare module 'utility/App' {
  const App: import('react').ComponentType;
  export default App;
}

declare module 'transfer/App' {
  const App: import('react').ComponentType;
  export default App;
}

declare module 'beneficiary/App' {
  const App: import('react').ComponentType;
  export default App;
}
