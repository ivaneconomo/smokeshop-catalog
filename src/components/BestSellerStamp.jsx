// pointer-events-none evita que el stamp intercepte clicks sobre la imagen
export const BestSellerStamp = ({ className }) => {
  return (
    <img
      src='/images/best_seller.png'
      alt='Best Seller'
      className={`absolute pointer-events-none ${className}`}
    />
  );
};
