function Pagination({ page, setPage, totalItems, pageSize }) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = page < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-footer">
      <div className="pagination">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        >
          ← Prev
        </button>
        <span className="page-info">
          <span className="current-page">{page}</span> / {totalPages}
        </span>
        <button 
          disabled={!hasNextPage} 
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default Pagination;