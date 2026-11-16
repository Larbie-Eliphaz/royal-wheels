import { Component } from "react";
import toast from "react-hot-toast";

class GlobalErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    toast.error(`Application error: ${error.message}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="text-slate-600">
            An unexpected error occurred. Please reload the page and try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-orange-500 px-5 py-3 font-medium text-white hover:bg-orange-600"
          >
            Reload page
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
