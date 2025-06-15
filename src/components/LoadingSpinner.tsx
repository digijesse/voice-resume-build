
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10 w-full">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
