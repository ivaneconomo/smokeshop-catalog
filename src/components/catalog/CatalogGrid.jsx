import Card from '../Card';

export default function CatalogGrid({ items, onPreview, activeStore, emojiMap }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 w-full items-start auto-rows-max'>
      {items.map((item) => (
        <Card
          key={item._id || item.client_id}
          item={item}
          onPreview={() => onPreview(item._id || item.client_id)}
          activeStore={activeStore}
          emojiMap={emojiMap}
        />
      ))}
    </div>
  );
}
