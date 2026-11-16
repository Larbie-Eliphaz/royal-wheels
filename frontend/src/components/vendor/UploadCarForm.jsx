import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import API from "../../api/axios";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const getImageValidationMessage = (images) => {
  if (images.length < 2) {
    return "Select at least two car photos.";
  }
  if (images.length > 10) {
    return "Select no more than 10 car photos.";
  }
  if (images.some((image) => !allowedImageTypes.includes(image.type))) {
    return "Use JPG, PNG, or WebP image files only.";
  }
  if (images.some((image) => image.size > MAX_IMAGE_SIZE)) {
    return "Each photo must be 5 MB or smaller.";
  }
  return "";
};

const initialFormData = {
  title: "",
  brand: "",
  model: "",
  year: "",
  type: "",
  price: "",
  rentalPrice: "",
  fuelType: "",
  transmission: "",
  description: "",
  location: "",
};

const UploadCarForm = ({ onUploaded }) => {
  const [formData, setFormData] = useState(initialFormData);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    imageInputRef.current?.setCustomValidity(
      getImageValidationMessage(images),
    );
  }, [images]);

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentFormData) => {
      const updatedFormData = { ...currentFormData, [name]: value };

      if (name === "type") {
        updatedFormData.price = value === "sale" ? currentFormData.price : "";
        updatedFormData.rentalPrice =
          value === "rent" ? currentFormData.rentalPrice : "";
      }

      return updatedFormData;
    });
  };

  //
  // HANDLE IMAGE
  //
  const handleImageChange = (event) => {
    setImages(Array.from(event.target.files || []));
  };

  const moveImage = (index, direction) => {
    setImages((currentImages) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= currentImages.length) {
        return currentImages;
      }

      const reorderedImages = [...currentImages];
      [reorderedImages[index], reorderedImages[targetIndex]] = [
        reorderedImages[targetIndex],
        reorderedImages[index],
      ];
      return reorderedImages;
    });
  };

  const removeImage = (index) => {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const imageValidationMessage = getImageValidationMessage(images);
    if (imageValidationMessage) {
      toast.error(imageValidationMessage);
      imageInputRef.current?.reportValidity();
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      // APPEND TEXT
      Object.keys(formData).forEach((key) => {
          data.append( key, formData[key] );
        }
      );

      // APPEND IMAGES
      for (const image of images) {
        data.append("images", image);
      }

      // API CALL
      await API.post("/cars/create", data);

      setFormData(initialFormData);
      setImages([]);
      form.reset();
      imageInputRef.current?.setCustomValidity("");
      await onUploaded?.();
    } catch (error) {
      if (!error?.globalNotificationShown) {
        toast.error(error?.message || "Upload failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="upload-car-form bg-white rounded-2xl shadow p-4 sm:p-6"
    >

      <input
        type="text"
        name="title"
        placeholder="Car Title"
        minLength={2}
        maxLength={120}
        pattern=".*\S.*"
        title="Enter a car title with at least 2 non-space characters."
        required
        value={formData.title}
        onChange={(e) => handleChange(e)}
        className="border rounded-xl p-3"
      />

      <input
        type="text"
        name="brand"
        placeholder="Brand"
        minLength={2}
        maxLength={80}
        pattern=".*\S.*"
        title="Enter a brand with at least 2 non-space characters."
        required
        value={formData.brand}
        onChange={(e) => handleChange(e)}
        className="border rounded-xl p-3"
      />

      <input
        type="text"
        name="model"
        placeholder="Model"
        minLength={1}
        maxLength={80}
        pattern=".*\S.*"
        title="Enter a model name."
        required
        value={formData.model}
        onChange={(e) => handleChange(e)}
        className="border rounded-xl p-3"
      />

      <input
        type="number"
        name="year"
        placeholder="Year"
        min="1900"
        max={new Date().getFullYear() + 1}
        step="1"
        required
        value={formData.year}
        onChange={(e) => handleChange(e)}
        className="border rounded-xl p-3"
      />

      <input
        type="text"
        name="location"
        placeholder="Location"
        minLength={2}
        maxLength={100}
        pattern=".*\S.*"
        title="Enter a location with at least 2 non-space characters."
        required
        value={formData.location}
        onChange={(e) => handleChange(e)}
        className="border rounded-xl p-3"
      />

      <select
        name="type"
        required
        value={formData.type}
        onChange={(e) => handleChange(e)}
        className="border rounded-xl p-3"
      >
        <option value="" disabled>
          Select Sale or Rent
        </option>
        <option value="sale">
          Sale
        </option>

        <option value="rent">
          Rent
        </option>
      </select>

      {formData.type === "sale" && (
        <input
          type="number"
          name="price"
          placeholder="Sale Price"
          min="0.01"
          step="0.01"
          required
          value={formData.price}
          onChange={(e) => handleChange(e)}
          className="border rounded-xl p-3"
        />
      )}

      {formData.type === "rent" && (
        <input
          type="number"
          name="rentalPrice"
          placeholder="Rental Price"
          min="0.01"
          step="0.01"
          required
          value={formData.rentalPrice}
          onChange={(e) => handleChange(e)}
          className="border rounded-xl p-3"
        />
      )}

      <select
        name="fuelType"
        value={formData.fuelType}
        onChange={(e) => handleChange(e)}
        className="border rounded-xl p-3"
      >
        <option value="">
          Fuel Type
        </option>

        <option value="Petrol">
          Petrol
        </option>

        <option value="Diesel">
          Diesel
        </option>

        <option value="Electric">
          Electric
        </option>
      </select>

      <select
        name="transmission"
        value={formData.transmission}
        onChange={(e) => handleChange(e)}
        className="border rounded-xl p-3"
      >
        <option value="">
          Transmission
        </option>

        <option value="Automatic">
          Automatic
        </option>

        <option value="Manual">
          Manual
        </option>
      </select>

      <textarea
        name="description"
        placeholder="Description"
        minLength={10}
        maxLength={2000}
        pattern=".*\\S.*"
        title="Enter at least 10 non-space characters, or leave this field empty."
        value={formData.description}
        onChange={(e) => handleChange(e)}
        className="border rounded-xl p-3 upload-car-full-row h-32"
      />

      <div className="upload-car-full-row rounded-xl border border-orange-200 bg-orange-50 p-4">
        <p className="font-semibold text-orange-950">Car photo order matters</p>
        <p className="mt-1 text-sm leading-6 text-orange-900">
          Select at least 2 photos. Choose the main exterior view first: the
          first photo in this list is the main image shown on the public cars
          page. Add other views, such as the interior, rear, and side views,
          after it.
        </p>
      </div>

      <label className="upload-car-full-row grid min-w-0 gap-2">
        <span className="font-medium text-slate-800">
          Car photos (2–10, up to 5 MB each)
        </span>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
          aria-invalid={Boolean(getImageValidationMessage(images))}
          aria-describedby="car-photo-guidance"
          onChange={handleImageChange}
          className="w-full min-w-0 border rounded-xl p-3"
        />
        <span id="car-photo-guidance" className="text-sm text-slate-500">
          JPG, PNG, or WebP only. Select the main exterior photo first. Use the
          arrows below to confirm or adjust the order before uploading.
        </span>
      </label>

      {images.length > 0 && (
        <ol className="upload-car-full-row grid min-w-0 gap-2" aria-label="Car photo upload order">
          {images.map((image, index) => (
            <li
              key={`${image.name}-${image.lastModified}-${index}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                <span className="mr-2 font-semibold">{index + 1}.</span>
                {image.name}
                {index === 0 && (
                  <span className="ml-2 inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
                    Main public photo
                  </span>
                )}
              </span>
              <div className="upload-photo-actions flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveImage(index, -1)}
                  aria-label={`Move ${image.name} up`}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => moveImage(index, 1)}
                  aria-label={`Move ${image.name} down`}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label={`Remove ${image.name}`}
                  className="rounded-lg border border-red-200 px-2 py-1 text-sm text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <button
        disabled={loading}
        className="upload-car-full-row bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl"
      >
        {loading ? "Uploading..." : "Upload Car"}
      </button>
    </form>
  );
};

export default UploadCarForm;