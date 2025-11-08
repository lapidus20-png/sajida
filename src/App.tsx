import { Component, ReactNode } from 'react';
import MainApp from './components/MainApp';
import TestApp from './TestApp';

// Mode test: changez à false pour charger l'app complète
const TEST_MODE = true;

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h1>
            <p className="text-gray-700 mb-4">
              Une erreur s'est produite lors du chargement de l'application.
            </p>
            <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
              <code className="text-sm text-red-600">
                {this.state.error?.message || 'Erreur inconnue'}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('App component rendering, TEST_MODE:', TEST_MODE);

  if (TEST_MODE) {
    return <TestApp />;
  }

  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

export default App;
