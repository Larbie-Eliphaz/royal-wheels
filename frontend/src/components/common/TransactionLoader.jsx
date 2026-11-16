const TransactionLoader = ({ message }) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
    role="status"
    aria-live="polite"
    aria-label={message}
  >
    <div className="flex items-center gap-4 rounded-2xl bg-white px-6 py-5 shadow-xl">
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500 motion-reduce:animate-none"
      />
      <span className="font-medium text-slate-800">{message}</span>
    </div>
  </div>
);

export default TransactionLoader;
