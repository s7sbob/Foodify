// src/components/VirtualizedList.tsx
import React, { memo, useCallback } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

// Define the props interface with a generic type
interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemSize: number;
  width?: number | string; // Optional, defaults to '100%'
  renderItem: (item: T, index: number) => React.ReactNode;
}

// Define the VirtualizedList component as a generic component
const VirtualizedList = <T,>({
  items,
  height,
  itemSize,
  width = '100%',
  renderItem,
}: VirtualizedListProps<T>) => {
  
  // Memoize the Row component to prevent unnecessary re-renders
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => (
      <div style={style}>
        {renderItem(items[index], index)}
      </div>
    ),
    [items, renderItem]
  );

  // Handle the case where there are no items
  if (items.length === 0) {
    return <div>No items available</div>;
  }

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemSize}
      width={width}
    >
      {Row}
    </List>
  );
};

// Export the memoized component to optimize performance
export default memo(VirtualizedList);
