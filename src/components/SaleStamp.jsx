export const SaleStamp = ({ className }) => {
  return (
    <img
      src='/images/price_drop.png'
      alt='Sale'
      className={`absolute pointer-events-none object-contain ${className}`}
    />
  );
};
