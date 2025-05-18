import { createContext, useContext, useState, ReactNode } from "react";
import useFetch from "../hooks/useFetch";
import { ProductResponse } from "../types/response";

import { useProductQuery } from "../hooks/useProductQuery";
import { OrderByOptionType } from "../types/categoryOption";
import { Product } from "../types/product";

interface ProductContextType {
  productsData: Product[] | undefined;
  productFetchLoading: boolean;
  productFetchError: Error | null;
  fetchProducts: () => Promise<void>;
  orderBy: OrderByOptionType | null;
  setOrderBy: (orderBy: OrderByOptionType) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [orderBy, setOrderBy] = useState<OrderByOptionType>("낮은 가격순");

  const {
    data: products,
    isLoading: productFetchLoading,
    error: productFetchError,
    fetcher: fetchProducts,
  } = useFetch<ProductResponse>(useProductQuery(orderBy), {}, false);

  return (
    <ProductContext.Provider
      value={{
        productsData: products?.content,
        productFetchLoading,
        productFetchError,
        fetchProducts,
        orderBy,
        setOrderBy,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const productContext = useContext(ProductContext);
  if (productContext === undefined) {
    throw new Error(
      "useProductContext는 프로바이더 안쪽에 위치를 해야 합니다."
    );
  }
  return productContext;
};
