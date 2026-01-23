import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Clear any local storage errors if present
    localStorage.removeItem('lastWishlistFetchError');
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoHome = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    if (this.props.navigate) {
      this.props.navigate('/shop/home');
    }
  };

  handleClearCache = () => {
    // Clear relevant localStorage items
    localStorage.removeItem('lastWishlistFetch');
    localStorage.removeItem('lastWishlistFetchError');
    localStorage.removeItem('wishlistCache');
    
    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected error occurred. Please try again.';
      const isNetworkError = errorMessage.includes('Network') || errorMessage.includes('timeout');
      const isAuthError = errorMessage.includes('auth') || errorMessage.includes('login') || errorMessage.includes('unauthorized');
      
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center bg-background">
          <div className="max-w-md w-full">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">
              {isNetworkError ? 'Connection Error' : 
               isAuthError ? 'Authentication Required' : 
               'Something went wrong'}
            </h3>
            
            <p className="text-muted-foreground mb-4">
              {errorMessage}
            </p>
            
            {this.props.showDetails && this.state.errorInfo && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm font-medium mb-2 hover:text-primary">
                  Error Details
                </summary>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40 font-mono">
                  {this.state.error?.toString()}
                  {"\n\n"}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry} 
                  className="gap-2 flex-1 sm:flex-none"
                  variant="default"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                {this.props.showHomeButton && (
                  <Button 
                    onClick={this.handleGoHome} 
                    className="gap-2 flex-1 sm:flex-none"
                    variant="outline"
                    size="lg"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                )}
              </div>
              
              {isNetworkError && (
                <Button 
                  onClick={this.handleClearCache} 
                  className="gap-2"
                  variant="ghost"
                  size="sm"
                >
                  Clear Cache & Reload
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper with hooks
function ErrorBoundaryWrapper(props) {
  const navigate = useNavigate();
  
  return (
    <ErrorBoundary 
      navigate={navigate}
      showDetails={props.showDetails || false}
      showHomeButton={props.showHomeButton !== false}
      onRetry={props.onRetry}
    >
      {props.children}
    </ErrorBoundary>
  );
}

export default ErrorBoundaryWrapper;