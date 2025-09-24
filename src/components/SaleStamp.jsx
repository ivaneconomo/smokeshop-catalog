export const SaleStamp = ({ className }) => {
  return (
    <img
      src='/images/sale_stamp.png'
      alt='Sale'
      className={`pointer-events-none absolute object-contain rotate-45 ${className}`}
    />
  );
};
