
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X
} from "lucide-react";

import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct
} from "../services/adminProductService";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyForm = {
  name: "",
  description: "",
  category: "",
  sizes: [
    {
      label: "",
      weightInGrams: "",
      price: ""
    }
  ]
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(amount || 0));

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [newImages, setNewImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminProducts();
      setProducts(data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(
        error.response?.data?.message ||
        "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm({
      ...emptyForm,
      sizes: [{ ...emptyForm.sizes[0] }]
    });
    setNewImages([]);
    setRemovedImageIds([]);
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      sizes: (product.sizes || []).map((size) => ({
        label: size.label || "",
        weightInGrams: String(size.weightInGrams ?? ""),
        price: String(size.price ?? "")
      }))
    });

    setNewImages([]);
    setRemovedImageIds([]);
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingProduct(null);
    setNewImages([]);
    setRemovedImageIds([]);
    setForm({
      ...emptyForm,
      sizes: [{ ...emptyForm.sizes[0] }]
    });
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSizeChange = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      sizes: previous.sizes.map((size, sizeIndex) =>
        sizeIndex === index
          ? { ...size, [field]: value }
          : size
      )
    }));
  };

  const addSize = () => {
    setForm((previous) => ({
      ...previous,
      sizes: [
        ...previous.sizes,
        {
          label: "",
          weightInGrams: "",
          price: ""
        }
      ]
    }));
  };

  const removeSize = (index) => {
    setForm((previous) => ({
      ...previous,
      sizes: previous.sizes.filter(
        (_, sizeIndex) => sizeIndex !== index
      )
    }));
  };

  const handleImageSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    setError("");

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    for (const file of selectedFiles) {
      if (!validTypes.includes(file.type)) {
        setError("Only JPEG, PNG, and WEBP images are allowed.");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError("Each image must be 5 MB or smaller.");
        event.target.value = "";
        return;
      }
    }

    setNewImages((previous) => [
      ...previous,
      ...selectedFiles
    ]);

    event.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const toggleExistingImageRemoval = (publicId) => {
    setRemovedImageIds((previous) =>
      previous.includes(publicId)
        ? previous.filter((id) => id !== publicId)
        : [...previous, publicId]
    );
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Product name is required.";
    }

    if (!form.description.trim()) {
      return "Product description is required.";
    }

    if (!form.category.trim()) {
      return "Product category is required.";
    }

    if (!form.sizes.length) {
      return "Add at least one product size.";
    }

    const labels = new Set();

    for (const size of form.sizes) {
      const label = size.label.trim();
      const weight = Number(size.weightInGrams);
      const price = Number(size.price);

      if (!label) {
        return "Every size must have a label.";
      }

      if (labels.has(label.toLowerCase())) {
        return `Duplicate size label: ${label}`;
      }

      labels.add(label.toLowerCase());

      if (
        !Number.isInteger(weight) ||
        weight < 250
      ) {
        return `Weight for ${label} must be a whole number of at least 250 grams.`;
      }

      if (!Number.isFinite(price) || price <= 0) {
        return `Enter a valid positive price for ${label}.`;
      }
    }

    const existingImages = editingProduct?.images || [];

    const remainingExistingImages = existingImages.filter(
      (image) => !removedImageIds.includes(image.publicId)
    );

    const totalImages =
      remainingExistingImages.length + newImages.length;

    if (totalImages > MAX_IMAGES) {
      return `A product can have at most ${MAX_IMAGES} images.`;
    }

    if (totalImages === 0) {
      return "At least one product image is required.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();

    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("category", form.category.trim());

    const sizes = form.sizes.map((size) => ({
      label: size.label.trim(),
      weightInGrams: Number(size.weightInGrams),
      price: Number(size.price)
    }));

    formData.append("sizes", JSON.stringify(sizes));

    if (editingProduct) {
      formData.append(
        "removeImages",
        JSON.stringify(removedImageIds)
      );
    }

    newImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setSaving(true);

      if (editingProduct) {
        await updateAdminProduct(editingProduct._id, formData);
        setSuccess("Product updated successfully.");
      } else {
        await createAdminProduct(formData);
        setSuccess("Product created successfully.");
      }

      setFormOpen(false);
      setEditingProduct(null);
      setNewImages([]);
      setRemovedImageIds([]);

      await loadProducts();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(
        error.response?.data?.message ||
        "Unable to save product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteAdminProduct(product._id);
      setSuccess("Product deleted successfully.");
      await loadProducts();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      setError(
        error.response?.data?.message ||
        "Unable to delete product."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2E9]">
      <header className="border-b border-[#E9DFD1] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-[#8E2922] sm:text-2xl">
              Product Management
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Manage your store catalogue
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#33251F] hover:bg-gray-50"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>

            <button
              onClick={loadProducts}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#33251F] hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 rounded-lg bg-[#8E2922] px-4 py-2 text-sm font-semibold text-white hover:bg-[#70201B]"
            >
              <Plus size={17} />
              Add product
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            <span>{success}</span>
            <button onClick={() => setSuccess("")} aria-label="Dismiss message">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#33251F]">
            Your products
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {products.length} products loaded
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-500">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-[#E9DFD1] bg-white p-10 text-center">
            <ImagePlus size={38} className="mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold text-[#33251F]">
              No products found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add your first product to start building your catalogue.
            </p>
            <button
              onClick={openCreateForm}
              className="mt-5 rounded-lg bg-[#8E2922] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#70201B]"
            >
              Add product
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id}
                className="overflow-hidden rounded-xl border border-[#E9DFD1] bg-white shadow-sm"
              >
                <div className="aspect-[16/10] bg-[#F7F2E9]">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#33251F]">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {product.category}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#F7F2E9] px-2.5 py-1 text-xs text-[#8E2922]">
                      {product.images?.length || 0} images
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {product.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(product.sizes || []).map((size, index) => (
                      <span
                        key={`${size.label}-${index}`}
                        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-[#33251F]"
                      >
                        {size.label}: {formatCurrency(size.price)}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => openEditForm(product)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#8E2922] px-3 py-2.5 text-sm font-semibold text-[#8E2922] hover:bg-[#8E2922] hover:text-white"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-6 w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-[#33251F]">
                  {editingProduct ? "Edit product" : "Add product"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter product information, sizes, prices and images.
                </p>
              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#33251F]">
                    Product name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFieldChange}
                    maxLength={120}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#8E2922]"
                    placeholder="Example: Mango Pickle"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#33251F]">
                    Category
                  </label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleFieldChange}
                    maxLength={80}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#8E2922]"
                    placeholder="Example: Traditional Pickles"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#33251F]">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFieldChange}
                  maxLength={2000}
                  rows={4}
                  required
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#8E2922]"
                  placeholder="Describe the product..."
                />
              </div>

              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-[#33251F]">
                    Product sizes and prices
                  </h3>

                  <button
                    type="button"
                    onClick={addSize}
                    className="flex items-center gap-1 text-sm font-semibold text-[#8E2922]"
                  >
                    <Plus size={16} />
                    Add size
                  </button>
                </div>

                <div className="space-y-3">
                  {form.sizes.map((size, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                    >
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Size label
                        </label>
                        <input
                          value={size.label}
                          onChange={(event) =>
                            handleSizeChange(index, "label", event.target.value)
                          }
                          placeholder="250g"
                          required
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#8E2922]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Weight (grams)
                        </label>
                        <input
                          type="number"
                          min="250"
                          step="1"
                          value={size.weightInGrams}
                          onChange={(event) =>
                            handleSizeChange(
                              index,
                              "weightInGrams",
                              event.target.value
                            )
                          }
                          placeholder="250"
                          required
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#8E2922]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={size.price}
                          onChange={(event) =>
                            handleSizeChange(index, "price", event.target.value)
                          }
                          placeholder="120"
                          required
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#8E2922]"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          disabled={form.sizes.length === 1}
                          className="rounded-lg border border-red-200 p-2.5 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Remove size ${index + 1}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {editingProduct && (
                <section>
                  <h3 className="mb-3 font-semibold text-[#33251F]">
                    Existing images
                  </h3>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(editingProduct.images || []).map((image) => {
                      const markedForRemoval =
                        removedImageIds.includes(image.publicId);

                      return (
                        <div
                          key={image.publicId}
                          className={`relative overflow-hidden rounded-lg border ${
                            markedForRemoval
                              ? "border-red-400 opacity-40"
                              : "border-gray-200"
                          }`}
                        >
                          <img
                            src={image.url}
                            alt="Product"
                            className="aspect-square w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              toggleExistingImageRemoval(image.publicId)
                            }
                            className={`absolute bottom-2 left-2 right-2 rounded-md px-2 py-2 text-xs font-semibold ${
                              markedForRemoval
                                ? "bg-gray-800 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {markedForRemoval ? "Keep image" : "Remove image"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-2 font-semibold text-[#33251F]">
                  {editingProduct ? "Add more images" : "Product images"}
                </h3>

                <p className="mb-3 text-xs text-gray-500">
                  JPEG, PNG or WEBP. Maximum 5 MB per image and 5 images per product in total.
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelection}
                  className="block w-full rounded-lg border border-gray-300 p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#F7F2E9] file:px-3 file:py-2 file:font-medium file:text-[#8E2922]"
                />

                {newImages.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {newImages.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-lg bg-[#F7F2E9] px-3 py-2 text-sm"
                      >
                        <span className="truncate text-[#33251F]">
                          {file.name}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="ml-3 text-red-600"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-[#33251F] hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#8E2922] px-6 py-3 text-sm font-semibold text-white hover:bg-[#70201B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Save changes"
                      : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
