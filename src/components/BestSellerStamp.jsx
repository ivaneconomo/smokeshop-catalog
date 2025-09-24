export const BestSellerStamp = ({ className }) => {
  return (
    <img
      src='/images/best_seller_stamp.PNG'
      alt='Best Seller'
      className={`pointer-events-none absolute object-contain rotate-[20deg] ${className}`}
    />
  );
};
