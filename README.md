# GoingMarry Wedding Boutique 💍

A premium, AI-powered marketplace for preloved wedding items.

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18 or higher.
- **npm**: Package manager (included with Node.js).

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd the-goingmarry-wedding-boutique
   ```

2. **Install Frontend dependencies**:
   In the root directory:
   ```bash
   npm install
   ```

3. **Install Backend dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```


## 🛠️ Running Locally

### 1. Start the Backend
The backend uses Express and PostgreSQL.
```bash
cd server
cp .env.example .env # Ensure you have DATABASE_URL and CLOUDINARY_* vars set
npm run dev
```
The server will run on `http://localhost:3001`.

### 2. Start the Frontend
The frontend is built with React and Vite. In a new terminal (from the root directory):
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## 🚀 Deployment (Unified Vercel Hosting)

We now host both the Frontend and Backend on **Vercel** for faster performance and easier management.

### Unified Deployment
1.  **Connect your repository** to Vercel.
2.  **Framework Preset**: Vite.
3.  **Root Directory**: `./` (default).
4.  **Environment Variables**:
    You must add all these to your **Vercel Project Settings**:

    | Category | Key | Value Description |
    |----------|-----|-------------------|
    | **DB** | `DATABASE_URL` | Your Neon PostgreSQL connection string |
    | **Auth** | `JWT_SECRET` | A secure random string for tokens |
    | **Cloudinary**| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name |
    | **Cloudinary**| `CLOUDINARY_API_KEY` | Your Cloudinary API Key |
    | **Cloudinary**| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret |
    | **AI** | `VITE_GOINGMARRY_API_KEY` | Your Gemini API Key |
    | **App** | `VALID_MEMBERSHIP_CODE` | Code for seller registration |
    | **App** | `VITE_API_URL` | Set to `/api` (for unified hosting) |

5.  **Build & Deploy**: Vercel will automatically detect the `vercel.json` and route `/api` requests to the serverless backend.


---

## � Tech Stack

### Frontend (The Storefront)
- **Framework**: [React](https://react.dev/) (via [Vite](https://vitejs.dev/)) - For a blazing fast, component-based UI.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - For type-safe, error-free code.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - For a custom, responsive, and elegant design system (using `font-serif` and specific color palettes like `wedding-gold`).
- **Icons**: Custom SVG collection (lightweight and pixel-perfect).

### Backend (The Engine)
- **Runtime**: [Node.js](https://nodejs.org/) - Executes JavaScript on the server.
- **Server**: [Express](https://expressjs.com/) - Handles API requests and routing.
- **Database**: [PostgreSQL](https://www.postgresql.org/) - A powerful, open-source object-relational database system.
- **Image Hosting**: [Cloudinary](https://cloudinary.com/) - For secure image storage and management.
- **Authentication**: JWT (JSON Web Tokens) & `bcrypt` for secure, stateless user management.

### AI Integration (The Magic)
- **Provider**: [Google Gemini](https://deepmind.google/technologies/gemini/) (via Google Gen AI SDK).
- **Model**: `gemini-1.5-flash` / `gemini-2.0-flash-exp` - For analyzing uploaded product photos and auto-filling details.

---

## �👥 User Roles

### 👰 Guest Experience
- **Interactive Browsing**: Explore curated items with a responsive grid. Click cards (outside the button) to view **detailed previews** including the **Seller's Note**.
- **Smart Cart**: Add items to your "Saved Collection". The "Make It Yours" button features real-time feedback (*"Securing..."* -> *"Treasure Secured!"*) and prevents adding more than the available quantity (*"Max Qty Reached"*).
- **Checkout Flow**: Review your selection, add a personal message, and copy a formatted order summary to clipboard/Messenger.
- **Scroll-to-Top**: Easily navigate back to the start of the collection with the floating action button.

### 🛍️ Seller Experience
- **Flexible Listing**: choice between **AI-Powered Auto-Fill** (toggleable) or manual entry.
- **Rich Text Notes**: Add "private" or public notes to listings. Support for **Bold** (Ctrl+B) and paragraphs to share SKU, location, or personal stories.
- **Visual Feedback**: The interface adapts to recognize you as a seller. The cart is hidden to focus on management, and "Add to Cart" buttons show *"Already Onboard"* to prevent accidental purchases of own stock.
- **Quick Actions**: Responsive navbar with quick access to "Add Item" and Profile management.

### 🛡️ Admin Experience
- **Global Oversight**: Delete any listing or remove sellers to maintain boutique quality.
- **Full Transparency**: View all details of any item, including seller notes and implementation details.
- **System Management**: Access to all seller features plus administrative override capabilities.

---

## 🏗️ Project Structure
- `/components`: Reusable UI components (Navbar, Modals, etc.).
- `/server`: Express backend, PostgreSQL database scripts, and API routes.
- `/services`: API client and AI integration services.
- `/constants`: Global theme tokens and icons.
- `/public`: Static assets.

---
## Postman Requests

Learn how to test the GoingMarry API using Postman with POST, GET, PUT, PATCH and DELETE requests for user-related actions.


### Environment Setup

Create a Postman environment named **GoingMarry – Local** with the following variables:

| Variable    | Value                       |
|------------|-----------------------------|
| `base_url`  | `http://localhost:3001`     |
| `jwt_token` | *(leave empty, auto-filled after login)* |

---

### Request: Register
#### 📸 screenshot
![alt text](docs/postman_register.png)

**Endpoint:** `POST {{base_url}}/auth/register`
**Headers:**
```text
Content-Type: application/json
```

**Body:**
```json
{
  "name":"test1",
  "email": "test1@goingmarry.com",
  "boutiqueName":"test1",
  "password": "test123",
  "membershipCode":""

}
```
#### Response success ✅
#### 📸 screenshot

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Imw4ZXplN3QxMiIsImVtYWlsIjoidGVzdDFAZ29pbmdtYXJyeS5jb20iLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNzY4MjAxMTIxfQ.outo0OkgTwPUHXtjShZ1lilu8MvdvEShHb8yj6dgrxw",
    "seller": {
        "id": "l8eze7t12",
        "name": "test1",
        "email": "test1@goingmarry.com",
        "boutiqueName": "test1",
        "isAdmin": false
    }
}

#### Response error ❌
#### 📸 screenshot
![alt text](docs/postman_register_error.png)

{
    "error": "Invalid membership code"
}
```

### Request: Login

**Endpoint:** `POST {{base_url}}/auth/login`
**Headers:**
```text
Content-Type: application/json
```

**Body:**
```json
{
  "email": "test1@goingmarry.com",
  "password": "test123"
}
```

#### Response success ✅
#### 📸 screenshot
![alt text](docs/postman_login.png)

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im4xYWVhcDQybyIsImVtYWlsIjoidGVzdEBnb2luZ21hcnJ5LmNvbSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NjgyMDA4NTl9.q_fopgwbMMADD79_inhrS3zstYpqyuELsBs10g4SsWg",
    "seller": {
        "id": "n1aeap42o",
        "name": "Test",
        "email": "test@goingmarry.com",
        "boutiqueName": "Test Boutique",
        "isAdmin": false
    }
}
```

#### Response error ❌
#### 📸 screenshot
![alt text](docs/postman_login_error.png)

{
    "error": "Invalid password"
}

#### Response error ❌
#### 📸 screenshot
![alt text](docs/postman_login_error_user_not_found.png)

{
    "error": "User not found"
}

### Request: Update Profile

**Endpoint:** `PATCH {{base_url}}/auth/profile`
**Headers:**
```text
Content-Type: application/json
```

**Body:**
```json
{
  "name": "test1",
  "boutiqueName": "test1"
}
```

#### Response success ✅
#### 📸 screenshot
![alt text](docs/postman_update_profile.png)

```json
{
    "message": "Profile updated successfully",
    "seller": {
        "id": "l8eze7t12",
        "name": "test1",
        "email": "test1@goingmarry.com",
        "boutiqueName": "test1",
        "isAdmin": false
    }
}
```
#### Response error ❌
#### 📸 screenshot
![alt text](docs/postman_update_profile_error.png)
```
{
    "error": "No changes detected to save."
}
```
### Request: Delete Profile

**Endpoint:** `DELETE {{base_url}}/auth/profile`
**Headers:**
```text
Content-Type: application/json
```

**Body:**
```json
{
  "email": "test1@goingmarry.com",
  "password": "test123"
}
```

#### Response success ✅
#### 📸 screenshot
![alt text](docs/postman_delete_profile.png)

{
    "message": "Account deleted successfully"
}

#### Response error ❌
#### 📸 screenshot
![alt text](docs/postman_delete_profile_error.png)
```
{
    "error": "User not found"
}
```

### Request: Get All Sellers (Admin Only)

**Endpoint:** `GET {{base_url}}/admin/sellers`
**Headers:**
```text
Authorization: Bearer {{jwt_token}}
```

#### Response success ✅
#### 📸 screenshot
![alt text](docs/postman_get_sellers.png)

```json
[
      {
        "id": "044xho6ey",
        "name": "test2",
        "email": "test2@goingmarry.com",
        "boutiqueName": "test1",
        "isAdmin": 0
    },
    {
        "id": "s89g1bw1p",
        "name": "test12",
        "email": "test1@goingmarry.com",
        "boutiqueName": "test1",
        "isAdmin": 0
    }
]
```

#### Response error ❌ (Not Admin)
#### 📸 screenshot
![alt text](docs/postman_get_sellers_error.png)

```json
{
    "error": "Access denied. Admin privileges required."
}
```

### Request: Delete Seller (Admin Only)

**Endpoint:** `DELETE {{base_url}}/admin/sellers/:id`
**Headers:**
```text
Authorization: Bearer {{jwt_token}}
```

**Params:**
```json
{
  "id": "d5yqzbcpb"
}
```

#### Response success ✅
#### 📸 screenshot
![alt text](docs/postman_delete_seller.png)

```json
{
    "message": "Seller and their products deleted"
}
```

#### Response error ❌ (Not Admin)
#### 📸 screenshot
![alt text](docs/postman_delete_seller_error.png)

```json
{
    "error": "Access denied. Admin privileges required."
}
```

#### Response error ❌ (Seller Not Found)
#### 📸 screenshot
![alt text](docs/postman_delete_seller_error_seller_not_found.png)

```json
{
    "error": "Seller not found"
}
```

#### Response error ❌ (Cannot delete own admin account)
#### 📸 screenshot
![alt text](docs/postman_delete_seller_error_cannot_delete_own_admin_account.png)

```json
{
    "error": "Cannot delete your own admin account"
}
```

### Request: Update Seller (Admin Only)

**Endpoint:** `PATCH {{base_url}}/admin/sellers/:id`
**Headers:**
```text
Authorization: Bearer {{jwt_token}}
```

**Params:**
```json
{
  "id": "d5yqzbcpb"
}
```

**Body:**
```json
{
  "name": "test",
  "boutiqueName": "test"
}
```

#### Response success ✅
#### 📸 screenshot
![alt text](docs/postman_update_seller.png)

```json
{
    "message": "Seller updated successfully"
}
```

#### Response error ❌ (Not Admin)
#### 📸 screenshot
![alt text](docs/postman_update_seller_error.png)

```json
{
    "error": "Access denied. Admin privileges required."
}
```

#### Response error ❌ (Seller Not Found)
#### 📸 screenshot
![alt text](docs/postman_update_seller_error_seller_not_found.png)

```json
{
    "error": "Seller not found"
}
```

### Request: Get Seller (Admin Only)

**Endpoint:** `GET {{base_url}}/admin/sellers/:id`
**Headers:**
```text
Authorization: Bearer {{jwt_token}}
```

**Params:**
```json
{
  "id": "d5yqzbcpb"
}
```

#### Response success ✅
#### 📸 screenshot
![alt text](docs/postman_get_seller.png)

```json
    {
        "id": "d5yqzbcpb",
        "name": "test@goingmarry.com",
        "email": "test@goingmarry.com",
        "boutiqueName": "test",
        "isAdmin": 0
    }
```

#### Response error ❌ (Not Admin)
#### 📸 screenshot
![alt text](docs/postman_get_seller_error.png)

```json
{
    "error": "Access denied. Admin privileges required."
}
```

#### Response error ❌ (Seller Not Found)
#### 📸 screenshot
![alt text](docs/postman_get_seller_error_seller_not_found.png)

```json
{
    "error": "Seller not found"
}
```

### Request: Get Seller Products (Admin Only)

**Endpoint:** `GET {{base_url}}/admin/sellers/:id/products`
**Headers:**
```text
Authorization: Bearer {{jwt_token}}
```

**Params:**
```json
{
  "id": "l8eze7t12"
}
```

#### Response success ✅
#### 📸 screenshot
![alt text](docs/postman_get_seller_products.png)

```json
[
    {
        "id": "l8eze7t12",
        "name": "test1",
        "email": "test1@goingmarry.com",
        "boutiqueName": "test1",
        "isAdmin": 0
    }
]
```

#### Response error ❌ (Not Admin)
#### 📸 screenshot
![alt text](docs/postman_get_seller_products_error.png)

```json
{
    "error": "Access denied. Admin privileges required."
}
```

#### Response error ❌ (Seller Not Found)
#### 📸 screenshot
![alt text](docs/postman_get_seller_products_error_seller_not_found.png)

```json
{
    "error": "Seller not found"
}
```

### Request: Get Seller Products (Admin Only)

**Endpoint:** `GET {{base_url}}/admin/sellers/:id/products/:productId`
**Headers:**
```text
Authorization: Bearer {{jwt_token}}
```

**Params:**
```json
{
  "id": "l8eze7t12",
  "productId": "l8eze7t12"
}
```

#### Response success ✅
#### 📸 screenshot
![alt text](docs/postman_get_seller_product.png)

```json
{
    "id": "l8eze7t12",
    "name": "test1",
    "email": "test1@goingmarry.com",
    "boutiqueName": "test1",
    "isAdmin": 0
}
```

#### Response error ❌ (Not Admin)
#### 📸 screenshot
![alt text](docs/postman_get_seller_product_error.png)

```json
{
    "error": "Access denied. Admin privileges required."
}
```

#### Response error ❌ (Seller Not Found)
#### 📸 screenshot
![alt text](docs/postman_get_seller_product_error_seller_not_found.png)

```json
{
    "error": "Seller not found"
}
```

#### Response error ❌ (Product Not Found)
#### 📸 screenshot
![alt text](docs/postman_get_seller_product_error_product_not_found.png)

```json
{
    "error": "Product not found"
}
```

### Request: Add Product (Seller)

**Endpoint:** `POST {{base_url}}/add/products`
**Headers:**
```text
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Vintage Lace Gown",
  "description": "A beautiful preloved gown from our collection.",
  "price": 2500,
  "category": "Fashion",
  "condition": "Like New",
  "imageUrl": "https://images.unsplash.com/photo-1513201099705-a9746e1e201f",
  "quantity": 1,
  "notes": "Original box included.",
  "isSold": false
}
```

#### Response success ✅
#### 📸 screenshot
![alt text](docs/postman_add_product.png)

```json
{
    "message": "Product successfully added"
}
```

#### Response error ❌ (Missing Fields)
#### 📸 screenshot
![alt text](docs/postman_add_product_error.png)

```json
{
    "error": "Missing required fields"
}
```

#### Response error ❌ (Duplicate Listing)
#### 📸 screenshot
![alt text](docs/postman_add_product_error_duplicate.png)

```json
{
    "error": "A listing with the same details already exists."
}
```

#### Response error ❌ (Unauthorized)
#### 📸 screenshot
![alt text](docs/postman_add_product_error_unauthorized.png)

```json
{
    "error": "Seller access required."
}
```

#### Response error ❌ (Invalid Price)
#### 📸 screenshot
![alt text](docs/postman_add_product_error_invalid_price.png)

```json
{
    "error": "Invalid price value"
}
```

### Request: Get Product by ID
#### 📸 screenshot
![alt text](docs/postman_get_product.png)
**Endpoint:** `GET {{base_url}}/products/:id`

**Params:**
```json
{
  "id": "bp1mnlisc"
}
```

#### Response success ✅
```json
{
    "id": "bp1mnlisc",
    "name": "Ruffle Bridal Robe and dress",
    "description": "sample",
    "price": 1199,
    "category": "Home",
    "condition": "Brand New",
    "imageUrl": "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800",
    "seller": "admin - RST",
    "sellerId": "n8lo38y98",
    "createdAt": 1768311390235,
    "isSold": 0,
    "quantity": 1,
    "notes": ""
}
```

#### Response error ❌ (Not Found)
#### 📸 screenshot
![alt text](docs/postman_get_product_error.png)
```json
{
    "error": "Product not found"
}
```

### Request: Update Product (Seller)
#### 📸 screenshot
![alt text](docs/postman_update_product.png)
**Endpoint:** `PATCH {{base_url}}/products/:id`
**Headers:**
```text
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Params:**
```json
{
  "id": "bp1mnlisc"
}
```

**Body:**
```json
{
    "description": "Product details have been updated successfully."
}
```

#### Response success ✅
```json
{
    "message": "Product updated successfully"
}
```

#### Response error ❌ (Unauthorized - Not Owner)
#### 📸 screenshot
![alt text](docs/postman_update_product_error_unauthorized.png)
```json
{
    "error": "Not authorized to update this product"
}
```
#### Response error ❌ (Invalid Fields)
#### 📸 screenshot
![alt text](docs/postman_update_product_error_invalid_price.png)
```json
{
    "error": "Invalid price value"
}
```

### Request: Delete Product (Seller)
#### 📸 screenshot
![alt text](docs/postman_delete_product.png)
**Endpoint:** `DELETE {{base_url}}/products/:id`
**Headers:**
```text
Authorization: Bearer {{jwt_token}}
```

**Params:**
```json
{
  "id": "ecg76fslf"
}
```

#### Response success ✅
```json
{
    "message": "Product deleted"
}
```

#### Response error ❌ (Unauthorized - Not Owner)
#### 📸 screenshot
![alt text](docs/postman_delete_product_error_unauthorized.png)
```json
{
    "error": "Not authorized to delete this product"
}
```







