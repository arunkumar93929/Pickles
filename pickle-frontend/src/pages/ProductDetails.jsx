
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    ShoppingBag,
    ShieldCheck,
    Truck,
    Leaf
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getProductById } from "../services/productService";
import { addToCart } from "../utils/cart";

const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);

function ProductDetails() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [addError, setAddError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const feedbackTimerRef = useRef(null);

    // Initial product fetch + automatic refresh every 15 seconds.
    useEffect(() => {
        let isMounted = true;
        let requestInProgress = false;

        const fetchProduct = async (initialLoad = false) => {
            if (requestInProgress) return;

            requestInProgress = true;

            try {
                const data = await getProductById(id);

                if (!isMounted) return;

                setProduct(data);

                // Preserve the selected pack if it still exists.
                // Update its details, including price, from the latest API data.
                setSelectedSize((currentSize) => {
                    const availableSizes = data?.sizes || [];

                    if (availableSizes.length === 0) {
                        return null;
                    }

                    return (
                        availableSizes.find(
                            (size) => size.label === currentSize?.label
                        ) || availableSizes[0]
                    );
                });

                // Preserve the selected image if it still exists.
                setSelectedImage((currentImage) => {
                    const availableImages = data?.images || [];

                    if (availableImages.length === 0) {
                        return "";
                    }

                    const imageStillExists = availableImages.some(
                        (item) => item.url === currentImage
                    );

                    return imageStillExists
                        ? currentImage
                        : availableImages[0].url;
                });

                if (initialLoad) {
                    setError("");
                }
            } catch (err) {
                if (!isMounted) return;

                if (initialLoad) {
                    setProduct(null);
                    setError(
                        err.response?.data?.message ||
                        "Unable to load this product. Please try again."
                    );
                } else if (err.response?.status === 404) {
                    // The product may have been deleted by the admin.
                    setProduct(null);
                    setError("This product is no longer available.");
                }
                // Other background refresh failures do not interrupt
                // the currently displayed product.
            } finally {
                requestInProgress = false;

                if (isMounted && initialLoad) {
                    setLoading(false);
                }
            }
        };

        // Reset state when navigating to a different product.
        setLoading(true);
        setError("");
        setProduct(null);
        setSelectedSize(null);
        setSelectedImage("");
        setQuantity(1);
        setAdded(false);
        setAddError("");

        if (feedbackTimerRef.current) {
            window.clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = null;
        }

        fetchProduct(true);

        const refreshInterval = window.setInterval(() => {
            fetchProduct(false);
        }, 15000);

        return () => {
            isMounted = false;
            window.clearInterval(refreshInterval);
        };
    }, [id]);

    // Clear the add-to-cart feedback timer when the component unmounts.
    useEffect(() => {
        return () => {
            if (feedbackTimerRef.current) {
                window.clearTimeout(feedbackTimerRef.current);
                feedbackTimerRef.current = null;
            }
        };
    }, []);

    const changeImage = (direction) => {
        const images = product?.images || [];

        if (images.length <= 1) return;

        const currentIndex = images.findIndex(
            (item) => item.url === selectedImage
        );

        const safeIndex = currentIndex === -1 ? 0 : currentIndex;

        const nextIndex =
            (safeIndex + direction + images.length) % images.length;

        setSelectedImage(images[nextIndex].url);
    };

    // Keyboard navigation for the product gallery.
    useEffect(() => {
        if (!product || product.images?.length <= 1) return;

        const handleKeyDown = (event) => {
            if (event.key === "ArrowLeft") {
                changeImage(-1);
            } else if (event.key === "ArrowRight") {
                changeImage(1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [product, selectedImage]);

    const handleAddToCart = () => {
        if (!product || !selectedSize) return;

        try {
            addToCart(product, selectedSize.label, quantity);

            setAddError("");
            setAdded(true);

            if (feedbackTimerRef.current) {
                window.clearTimeout(feedbackTimerRef.current);
            }

            feedbackTimerRef.current = window.setTimeout(() => {
                setAdded(false);
                feedbackTimerRef.current = null;
            }, 2200);
        } catch (err) {
            setAdded(false);
            setAddError(
                err.message || "Unable to add this product to cart."
            );
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="grid min-h-[55vh] place-items-center bg-[#FAF5EB]">
                    <p className="text-sm text-[#65564C]">
                        Loading product details...
                    </p>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <Navbar />
                <main className="grid min-h-[55vh] place-items-center bg-[#FAF5EB] px-5 text-center">
                    <div>
                        <h1 className="font-serif text-3xl text-[#33251F]">
                            {error ? "Unable to Load Product" : "Product Not Found"}
                        </h1>

                        <p className="mt-3 text-sm text-[#65564C]">
                            {error || "The requested product could not be found."}
                        </p>

                        <Link
                            to="/shop"
                            className="mt-6 inline-flex bg-[#8E2922] px-6 py-3 text-sm font-semibold text-white"
                        >
                            Back to Shop
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const image = selectedImage;

    const isNonVegetarian =
        product.category?.toLowerCase().includes("non");

    const currentImageIndex = product.images?.findIndex(
        (item) => item.url === selectedImage
    ) ?? -1;

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#FAF5EB] px-5 py-9 lg:px-10 lg:py-14">
                <div className="mx-auto max-w-7xl">
                    <Link
                        to="/shop"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#8E2922] hover:text-[#702019]"
                    >
                        <ArrowLeft size={16} />
                        Back to Shop
                    </Link>

                    <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                        <div>
                            <div className="relative overflow-hidden bg-[#E8DDCE]">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={product.name}
                                        className="aspect-[4/4.4] w-full object-cover"
                                    />
                                ) : (
                                    <div className="grid aspect-[4/4.4] place-items-center text-sm text-[#827365]">
                                        Image unavailable
                                    </div>
                                )}

                                <span
                                    className={`absolute left-4 top-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white ${
                                        isNonVegetarian
                                            ? "bg-[#8E2922]"
                                            : "bg-[#58613B]"
                                    }`}
                                >
                                    {isNonVegetarian
                                        ? "Non-Vegetarian Pickle"
                                        : "Vegetarian Pickle"}
                                </span>

                                {product.images?.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => changeImage(-1)}
                                            aria-label="Previous product image"
                                            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-white/90 text-[#8E2922] shadow transition hover:bg-white"
                                        >
                                            <ChevronLeft size={22} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => changeImage(1)}
                                            aria-label="Next product image"
                                            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-white/90 text-[#8E2922] shadow transition hover:bg-white"
                                        >
                                            <ChevronRight size={22} />
                                        </button>

                                        <span className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 text-xs text-white">
                                            {currentImageIndex + 1} / {product.images.length}
                                        </span>
                                    </>
                                )}
                            </div>

                            {product.images?.length > 1 && (
                                <div className="mt-4 grid grid-cols-5 gap-3">
                                    {product.images.map((item, index) => (
                                        <button
                                            key={item.publicId || index}
                                            type="button"
                                            onClick={() =>
                                                setSelectedImage(item.url)
                                            }
                                            aria-label={`View product image ${index + 1}`}
                                            aria-pressed={
                                                selectedImage === item.url
                                            }
                                            className={`overflow-hidden border-2 transition ${
                                                selectedImage === item.url
                                                    ? "border-[#8E2922]"
                                                    : "border-transparent hover:border-[#D9C9B5]"
                                            }`}
                                        >
                                            <img
                                                src={item.url}
                                                alt={`${product.name} ${index + 1}`}
                                                className="aspect-square w-full bg-[#E8DDCE] object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <section className="lg:pt-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8E2922]">
                                Authentic Andhra Flavours
                            </p>

                            <h1 className="mt-4 font-serif text-4xl leading-tight text-[#33251F] md:text-5xl">
                                {product.name}
                            </h1>

                            <p className="mt-5 text-sm leading-8 text-[#65564C]">
                                {product.description}
                            </p>

                            <div className="mt-7 border-y border-[#E5D8C6] py-5">
                                <p className="font-serif text-3xl text-[#8E2922]">
                                    {selectedSize
                                        ? formatPrice(selectedSize.price)
                                        : "Price unavailable"}
                                </p>

                                <p className="mt-1 text-xs leading-6 text-[#827365]">
                                    Price per selected pack.
                                </p>
                            </div>

                            <div className="mt-7">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-sm font-semibold text-[#33251F]">
                                        Choose your pack
                                    </h2>

                                    <span className="text-xs text-[#8A7A6A]">
                                        {product.sizes?.length || 0} available options
                                    </span>
                                </div>

                                {product.sizes?.length > 0 ? (
                                    <div className="mt-3 grid grid-cols-3 gap-3">
                                        {product.sizes.map((size) => (
                                            <button
                                                key={size._id || size.label}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedSize(size)
                                                }
                                                className={`border px-3 py-4 text-sm font-semibold transition ${
                                                    selectedSize?.label === size.label
                                                        ? "border-[#8E2922] bg-[#8E2922] text-white"
                                                        : "border-[#D9C9B5] bg-white text-[#65564C] hover:border-[#8E2922]"
                                                }`}
                                            >
                                                <span className="block">
                                                    {size.label}
                                                </span>

                                                <span
                                                    className={`mt-2 block text-xs ${
                                                        selectedSize?.label === size.label
                                                            ? "text-white/90"
                                                            : "text-[#8E2922]"
                                                    }`}
                                                >
                                                    {formatPrice(size.price)}
                                                </span>

                                                {selectedSize?.label === size.label && (
                                                    <Check
                                                        size={14}
                                                        className="mx-auto mt-2"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-[#8E2922]">
                                        No pack sizes are currently available.
                                    </p>
                                )}
                            </div>

                            <div className="mt-7 flex flex-wrap items-end gap-5">
                                <div>
                                    <h2 className="mb-3 text-sm font-semibold text-[#33251F]">
                                        Quantity
                                    </h2>

                                    <div className="flex h-12 items-center border border-[#D9C9B5] bg-white">
                                        <button
                                            type="button"
                                            aria-label="Decrease quantity"
                                            onClick={() =>
                                                setQuantity((value) =>
                                                    Math.max(1, value - 1)
                                                )
                                            }
                                            className="px-4 text-[#8E2922]"
                                        >
                                            <Minus size={15} />
                                        </button>

                                        <span className="min-w-8 text-center text-sm font-semibold text-[#33251F]">
                                            {quantity}
                                        </span>

                                        <button
                                            type="button"
                                            aria-label="Increase quantity"
                                            onClick={() =>
                                                setQuantity((value) =>
                                                    Math.min(20, value + 1)
                                                )
                                            }
                                            className="px-4 text-[#8E2922]"
                                        >
                                            <Plus size={15} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={!selectedSize}
                                    className={`inline-flex h-12 flex-1 items-center justify-center gap-3 px-6 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        added
                                            ? "bg-[#58613B]"
                                            : "bg-[#8E2922] hover:bg-[#702019]"
                                    }`}
                                >
                                    {added ? (
                                        <>
                                            <Check size={17} />
                                            Added to Cart
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag size={17} />
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                            </div>

                            {addError && (
                                <p
                                    role="alert"
                                    className="mt-3 text-sm text-[#8E2922]"
                                >
                                    {addError}
                                </p>
                            )}

                            <div className="mt-8 grid gap-4 border-t border-[#E5D8C6] pt-6 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <Leaf size={19} className="mt-1 shrink-0 text-[#8E2922]" />
                                    <div>
                                        <p className="text-sm font-semibold text-[#33251F]">
                                            Traditional flavours
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-[#827365]">
                                            Inspired by Andhra home-style recipes.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <ShieldCheck size={19} className="mt-1 shrink-0 text-[#8E2922]" />
                                    <div>
                                        <p className="text-sm font-semibold text-[#33251F]">
                                            Carefully packed
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-[#827365]">
                                            Products are prepared and packed with care.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Truck size={19} className="mt-1 shrink-0 text-[#8E2922]" />
                                    <div>
                                        <p className="text-sm font-semibold text-[#33251F]">
                                            Delivery details
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-[#827365]">
                                            Delivery information is available at checkout.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {added && (
                                <p className="mt-5 text-sm text-[#58613B]">
                                    {quantity} × {selectedSize.label} {product.name} added.{" "}
                                    <Link
                                        to="/cart"
                                        className="font-semibold underline"
                                    >
                                        View cart
                                    </Link>
                                </p>
                            )}
                        </section>
                    </div>

                    <div className="mt-16 border-t border-[#E5D8C6] pt-10 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8E2922]">
                            A little taste of home
                        </p>

                        <h2 className="mt-3 font-serif text-3xl text-[#33251F]">
                            Bring Andhra to your table.
                        </h2>

                        <Link
                            to="/shop"
                            className="mt-6 inline-flex items-center gap-3 border border-[#8E2922] px-6 py-3 text-sm font-semibold text-[#8E2922] hover:bg-[#8E2922] hover:text-white"
                        >
                            Explore More Pickles
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default ProductDetails;
