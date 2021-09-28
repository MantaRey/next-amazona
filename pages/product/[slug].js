import React from 'react';
import { useRouter } from 'next/router';
import data from '../../utils/data';

const ProductScreen = () => {
  const router = useRouter();
  const { slug } = router.query;
  const product = data.products.find((product) => product.slug === slug);
  if (!product) {
    return <div>Produt Not Found</div>;
  }
  return (
    <div>
      <h1>{product.name}</h1>
    </div>
  );
};

export default ProductScreen;
