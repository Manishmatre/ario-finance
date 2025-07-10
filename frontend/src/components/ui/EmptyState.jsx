export default function EmptyState({ message = "No data found." }) {
  return (
    <div className="text-center text-gray-400 py-8">{message}</div>
  );
} 