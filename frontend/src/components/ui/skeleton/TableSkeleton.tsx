interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="border-b border-gray-100 dark:border-gray-800 py-3 px-4 sm:px-6">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={`header-${i}`}
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"
            ></div>
          ))}
        </div>
      </div>

      {/* Body Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="border-b border-gray-100 dark:border-gray-800 py-3.5 px-4 sm:px-6"
        >
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className="h-5 bg-gray-200 dark:bg-gray-700 rounded flex-1"
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
