export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex gap-2 justify-center mt-4">
      <button
        className="px-3 py-1 rounded bg-gray-200"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >Prev</button>
      <span className="px-2">{page} / {totalPages}</span>
      <button
        className="px-3 py-1 rounded bg-gray-200"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >Next</button>
    </div>
  );
} 