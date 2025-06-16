# 🏍️ Product Search Platform

A modern, high-performance product search web application built with **Next.js**, **React**, and **Fuse.js**. Designed to handle large product catalogs with intelligent **search**, **filtering**, and **sorting** capabilities — optimized for real-world e-commerce use.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge\&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge\&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge\&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge\&logo=tailwind-css)

---

## ✨ Features

### 🔍 **Advanced Search**

* Fuzzy search powered by **Fuse.js**
* Searches across `title`, `tags`, `description`, `vendor`
* Debounced input (300ms) for performance
* Real-time results as user types

### 🏛️ **Dynamic Filters**

* ✅ **Vendor** multi-select checkbox filter
* ✅ **Status** checkbox filter (if available)
* ✅ **Tags** multi-select checkbox filter with cleaned tags (excludes `_` or `|`)
* ✅ **Price Range** Enter the price change that you want
* ✅ All filters work in combination with each other
* ✅ Filters collapse by default on mobile

### 📊 **Sorting Options**

* Relevance (default, via Fuse.js score)
* Price: Low → High / High → Low
* Alphabetical (A–Z)
* Rating (Highest first)

### 🧱 **Product Grid**

* Responsive grid: 1–4 columns based on screen size
* Beautiful product cards with:

  * Title, price, vendor, tags
  * Ratings from JSON metafields
  * Clickable product links
  * Optimized image loading

### 📱 **Mobile Friendly**

* Filters panel collapses by default on mobile
* Touch-optimized input controls and sliders
* Clean and intuitive layout on all screen sizes

---

## ✨ Quick Start

### Step 1: Add Your CSV File

Before running the app for the first time:

1. Place your CSV file in the `csv-files/` directory
2. Rename the file to:

```bash
csv-files/products.csv
```

### Step 2: Convert CSV to JSON

Run the conversion script to generate `products.json`:

```bash
node csv-to-json.js
```

* This script contains a hardcoded path to `products.csv`
* You can update the path inside `csv-to-json.js` if needed
* Output: `products.json` which powers the search system

### Step 3: Start the Development Server

```bash
npm install
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---



## 🧐 How It Works

### Smart Search Logic

* Configured Fuse.js options with weighted fields
* Filters are applied on top of search results
* Sort is applied on final filtered results

### Tag Cleaner

* Tags are split and cleaned
* Excludes tags with `_` or `|` characters



---

## 🧪 Test Coverage

This project includes unit and component tests written with Jest and React Testing Library.

### ✅ Covered Test Files

- `search-utils.test.ts`: Tests the Fuse.js search logic, including fallback matching and logging.
- `useProductSearch.test.ts`: Tests the `useProductSearch` hook for loading state and filter handling.
- `search-input.test.tsx`: Tests the `<SearchInput />` component’s rendering and input behavior.


## 🧪 Testing

```bash
npm test           # Run all tests
```


## 💡 Tips

* Keep your CSV fields consistent with Shopify export
* Make sure `tags`, `vendor`, and `featured_image` are valid JSON if embedded
* Supports 6,000+ products and large files (\~50MB+)


---

## 🔄 Deployment

```bash
npm run build
npm start
```

You can deploy this app to **Vercel**, **Netlify**, or **any Node hosting platform**.

---


🚀 Potential Future Enhancements

✅ Log search queries in a database to analyze popular keywords and improve results

✅ Add a cache layer (Redis) to speed up repeated searches

✅ Add rate limiting to protect the search API from abuse

✅ Implement search suggestions or autocomplete as users type

✅ Add "Did you mean..." for fuzzy or misspelled search queries

---

