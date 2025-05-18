import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { vi } from "vitest";
import App from "../App";
import { screen } from "@testing-library/react";
import { expect } from "vitest";
// import useFetch from "../hooks/useFetch";
import "@testing-library/jest-dom"; // For toBeInTheDocument matcher

// Import type definitions
import type { Product } from "../types/product";

// Mock fetch functions
const mockFetchProducts = vi.fn();
const mockFetchCart = vi.fn();
const mockShowError = vi.fn();

// Define our test data
const mockProductsData: Product[] = [
  {
    id: 1,
    category: "패션잡화",
    name: "바지",
    price: 1000000,
    imageUrl: "laptop.jpg",
  },
  {
    id: 2,
    category: "패션잡화",
    name: "치마",
    price: 50000,
    imageUrl: "chair.jpg",
  },
  {
    id: 3,
    category: "식료품",
    name: "코카콜라",
    price: 2000,
    imageUrl: "coke.jpg",
  },
  {
    id: 4,
    category: "식료품",
    name: "사이다",
    price: 2000,
    imageUrl: "cider.jpg",
  },
];

const mockCartData = [
  {
    id: 101,
    product: {
      id: 2,
      category: "패션잡화",
      name: "치마",
      price: 50000,
      imageUrl: "chair.jpg",
    },
    quantity: 1,
  },
];

// Default product context mock
let productContextMock = {
  productsData: mockProductsData,
  productFetchLoading: false,
  productFetchError: null as Error | null,
  fetchProducts: mockFetchProducts,
  orderBy: "낮은 가격순",
  setOrderBy: vi.fn(),
};

// Standard mocks
vi.mock("../contexts/ProductContext", () => ({
  useProductContext: () => productContextMock,
  ProductContextProvider: ({ children }) => <>{children}</>,
}));

vi.mock("../contexts/CartContext", () => ({
  useCartContext: () => ({
    cartData: mockCartData,
    cartFetchLoading: false,
    cartFetchError: null,
    fetchCart: mockFetchCart,
    setCartLength: vi.fn(),
    cartLength: 1,
  }),
  CartContextProvider: ({ children }) => <>{children}</>,
}));

vi.mock("../contexts/ErrorContext", () => ({
  useErrorContext: () => ({
    showError: mockShowError,
    error: null,
  }),
  ErrorContextProvider: ({ children }) => <>{children}</>,
}));

// Mock the emotion css prop
vi.mock("@emotion/react", () => ({
  jsx: (
    type: React.ElementType,
    props: Record<string, unknown>,
    ...children: React.ReactNode[]
  ) => {
    return React.createElement(
      type,
      { ...props, className: "emotion-class" },
      ...children
    );
  },
  css: () => ({ name: "mock-css-result" }),
}));

vi.mock("../components/Spinner/Spinner", () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner" />,
}));

vi.mock("../components/ErrorToast/ErrorToast", () => ({
  __esModule: true,
  default: ({ error }) => <div data-testid="error-toast">{error.message}</div>,
}));

describe("App - 필터링 및 상태 테스트", () => {
  beforeEach(() => {
    // Reset to default mock values before each test
    productContextMock = {
      productsData: mockProductsData,
      productFetchLoading: false,
      productFetchError: null,
      fetchProducts: mockFetchProducts,
      orderBy: "낮은 가격순",
      setOrderBy: vi.fn(),
    };

    mockFetchProducts.mockClear();
    mockFetchCart.mockClear();
    mockShowError.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("컴포넌트 마운트시 fetchProducts와 fetchCart가 호출된다", () => {
    render(<App />);

    expect(mockFetchProducts).toHaveBeenCalledTimes(1);
    expect(mockFetchCart).toHaveBeenCalledTimes(1);
  });

  it("카테고리 필터링이 올바르게 동작한다", () => {
    render(<App />);

    // Initially we should see all products
    expect(screen.getByText("바지")).toBeInTheDocument();
    expect(screen.getByText("치마")).toBeInTheDocument();
    expect(screen.getByText("코카콜라")).toBeInTheDocument();
    expect(screen.getByText("사이다")).toBeInTheDocument();

    const categoryDropdown = screen.getByText("전체");
    fireEvent.click(categoryDropdown);

    const foodOption = screen.getByText("식료품");
    fireEvent.click(foodOption);

    // After filtering, only food items should be visible
    expect(screen.getByText("코카콜라")).toBeInTheDocument();
    expect(screen.getByText("사이다")).toBeInTheDocument();
    expect(screen.queryByText("바지")).not.toBeInTheDocument();
    expect(screen.queryByText("치마")).not.toBeInTheDocument();
  });

  it("로딩 상태에서는 스피너를 표시한다", () => {
    // Set loading state before rendering
    productContextMock.productFetchLoading = true;
    productContextMock.productsData = [] as Product[];

    render(<App />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("에러 상태에서는 에러 메시지를 표시한다", () => {
    const testError = new Error("API 에러 발생");

    // Set error state before rendering
    productContextMock.productFetchError = testError;
    productContextMock.productsData = [] as Product[];

    render(<App />);

    // Verify the error handler was called
    expect(mockShowError).toHaveBeenCalledWith(testError);
  });
});
