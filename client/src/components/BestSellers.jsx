import React from "react";
import HomepageProducts from "./HomepageProducts";
import ShopBy from "./ShopBy";

export const BestSellers = () => {

  const data = [
    { src: "/GenInfo/adidas.jpg", name: "Adidas", to: "/search/adidas" },
    { src: "/GenInfo/nike.png", name: "Nike", to: "/search/nike" },
    { src: "/GenInfo/skechers.jpg", name: "Skechers", to: "/search/skechers" },
    { src: "/GenInfo/puma.jpg", name: "Puma", to: "/search/puma" },
  ];

  return (
    <div className="prose prose-2xl">
        <ShopBy title="Best Sellers" filter="bestSellers" />
        <HomepageProducts data={data} />
    </div>
  );
};

export default BestSellers;