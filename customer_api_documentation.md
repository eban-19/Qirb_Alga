# Qirb Alga Mobile App: Customer API Documentation

This documentation is designed specifically for **Mobile App Developers** building the customer-facing mobile application. It covers all endpoints required for customer authentication, searching pensions/availabilities, managing bookings, updating customer profiles, and initializing secure payments.

---

## 📌 Base Configuration
- **Base URL**: `http://<server-ip>:3006/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token in authorization header for private endpoints.
  ```http
  Authorization: Bearer <your_jwt_token>
  ```

---

## 🔑 1. Authentication & Profile Endpoints

### 📲 POST `/auth/otp-login` (OTP-based Authentication)
Use this endpoint to verify a customer via SMS OTP code. If the phone number is not registered, it **automatically registers** the user as a `Customer` with `Approved` status.

- **URL**: `/auth/otp-login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "phone": "+251912345678",
    "code": "123456",
    "fullName": "Abebe Kebede" (optional, used for first-time registration fallback)
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": 8,
        "email": "+251912345678@guest.qirbalga.com",
        "full_name": "Abebe Kebede",
        "phone": "+251912345678",
        "role": "Customer",
        "approved": 1
      }
    }
  }
  ```

---

### 📧 POST `/auth/register` (Password-based Registration)
Alternative registration flow if standard credentials are preferred.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "customer@gmail.com",
    "password": "SecurePassword123",
    "fullName": "Abebe Kebede",
    "phone": "+251912345678",
    "role": "Customer"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "userId": 8,
      "email": "customer@gmail.com",
      "fullName": "Abebe Kebede",
      "role": "Customer",
      "status": "approved"
    }
  }
  ```

---

### 🔑 POST `/auth/login` (Password-based Login)
Authenticate standard credentials.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "customer@gmail.com",
    "password": "SecurePassword123"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": 8,
        "email": "customer@gmail.com",
        "full_name": "Abebe Kebede",
        "phone": "+251912345678",
        "role": "Customer",
        "approved": 1
      }
    }
  }
  ```

---

### 👤 GET `/auth/profile` (Get Customer Profile)
Fetches information about the currently authenticated customer.
- **URL**: `/auth/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 8,
        "email": "customer@gmail.com",
        "full_name": "Abebe Kebede",
        "phone": "+251912345678",
        "role": "Customer",
        "status": "Approved",
        "created_at": "2026-05-21T12:00:00.000Z"
      }
    }
  }
  ```

---

### ✍️ PUT `/auth/profile` (Update Profile Details)
Allows the customer to update their name or phone number.
- **URL**: `/auth/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "fullName": "Abebe K. Kebede",
    "phone": "+251912345679"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "statusChanged": false
  }
  ```

---

## 🏨 2. Public Directory & Search Endpoints

### 🔍 GET `/public/pensions` (Search & Browse Pensions)
Fetch a paginated list of all active pensions. Includes sub-objects for packages and current active promotions.

- **URL**: `/public/pensions`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (optional, default: `1`)
  - `limit` (optional, default: `10`)
  - `search` (optional - matches pension name, description, or address)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "2",
          "name": "Bole Luxury Pension",
          "description": "Premium rooms with full amenities",
          "locationName": "Bole, Addis Ababa, Ethiopia",
          "city": "Addis Ababa",
          "latitude": 9.03,
          "longitude": 38.74,
          "availableRooms": 5,
          "images": ["/uploads/Bole_1.jpg"],
          "phone": "+251911111111",
          "email": "bole@pension.com",
          "promotions": [
            {
              "promotion_id": 1,
              "title": "Weekend Special",
              "discount_percentage": 10
            }
          ],
          "packages": [
            {
              "id": 4,
              "name": "Deluxe Double",
              "price": 1200,
              "description": "Double bed, hot water, smart TV",
              "services": ["Wifi", "Smart TV", "Hot Water"],
              "availableRooms": 3,
              "isMostPopular": true,
              "images": ["/uploads/room_1.jpg"],
              "capacity": 2,
              "beds": 1,
              "discount_percentage": 10,
              "discount_min_days": 3
            }
          ]
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1
      }
    }
  }
  ```

---

### 🏨 GET `/public/pensions/:id` (Get Pension Details)
Get complete information for a single pension.

- **URL**: `/public/pensions/:id`
- **Method**: `GET`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "2",
      "name": "Bole Luxury Pension",
      "description": "Premium rooms with full amenities",
      "locationName": "Bole, Addis Ababa, Ethiopia",
      "latitude": 9.03,
      "longitude": 38.74,
      "availableRooms": 5,
      "images": ["/uploads/Bole_1.jpg"],
      "packages": [...]
    }
  }
  ```

---

### 📅 GET `/public/availability` (Check Available Packages for Dates)
Checks available package configurations and counts for a specific range of stay dates.

- **URL**: `/public/availability`
- **Method**: `GET`
- **Query Parameters**:
  - `pensionId` (required)
  - `checkIn` (required, e.g., `2026-06-01`)
  - `checkOut` (required, e.g., `2026-06-05`)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "packages": [
        {
          "packageId": 4,
          "packageName": "Deluxe Double",
          "availableRooms": 3,
          "price": 1200,
          "discountPercentage": 10,
          "discountMinDays": 3
        }
      ],
      "promotions": []
    }
  }
  ```

---

## 📅 3. Booking Management

### 📝 POST `/public/bookings` (Create a Stay Booking)
Submit a booking request. Can be called anonymously (an account is auto-created using the phone/email) or with a logged-in `Bearer <token>` to link automatically.
*Note: This route expects multipart/form-data as it handles ID document uploads.*

- **URL**: `/public/bookings`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>` (optional)
- **Request Body (Multipart Form-Data)**:
  - `pensionId` (integer): ID of the pension
  - `packageName` (string): Name of the package being booked
  - `checkIn` (string, ISO-date): Check-in date (`2026-06-01`)
  - `checkOut` (string, ISO-date): Check-out date (`2026-06-05`)
  - `fullName` (string): Guest's full name
  - `phone` (string): Guest's phone number
  - `email` (string, optional): Guest's email
  - `totalPrice` (float): Total booking price
  - `rooms` (integer, optional): Number of rooms to book (default `1`)
  - `idDocument` (file, required): Attachment file of the guest's ID card/Passport.
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Booking created successfully",
    "data": {
      "bookingId": 43,
      "bookingIds": [43],
      "customer": {
        "fullName": "Abebe Kebede",
        "phone": "+251912345678",
        "email": "customer@gmail.com"
      },
      "booking": {
        "id": 43,
        "status": "Pending",
        "checkIn": "2026-06-01T00:00:00.000Z",
        "checkOut": "2026-06-05T00:00:00.000Z",
        "totalPrice": 4800,
        "packageName": "Deluxe Double",
        "passCode": "XJ8D3S",
        "roomNumber": "104"
      }
    }
  }
  ```

---

### 📂 GET `/customer/bookings` (Get Customer Bookings History)
Get all previous and current bookings made by the authenticated customer.

- **URL**: `/customer/bookings`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>` (required)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "booking_id": 43,
        "room_id": 12,
        "room_number": "104",
        "check_in_date": "2026-06-01T00:00:00.000Z",
        "check_out_date": "2026-06-05T00:00:00.000Z",
        "total_price": "4800.00",
        "status": "Pending",
        "pass_code": "XJ8D3S",
        "booking_source": "App",
        "created_at": "2026-05-21T12:00:00.000Z",
        "room": {
          "room_id": 12,
          "room_number": "104",
          "pension": {
            "pension_id": 2,
            "name": "Bole Luxury Pension",
            "address": "Bole, Addis Ababa"
          }
        },
        "payment": null
      }
    ]
  }
  ```

---

### 🔍 GET `/public/bookings/:id/status` (Check Specific Booking Status)
Used to fetch ephemeral booking state or updates quickly without authentication.

- **URL**: `/public/bookings/:id/status`
- **Method**: `GET`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "Pending",
      "check_in_date": "2026-06-01T00:00:00.000Z",
      "check_out_date": "2026-06-05T00:00:00.000Z",
      "total_price": "4800.00",
      "room_type": "Deluxe",
      "pension_name": "Bole Luxury Pension",
      "package_name": "Deluxe Double"
    }
  }
  ```

---

## 💳 4. Payment Integration (Chapa Gateway)

The platform supports digital checkout using **Chapa**. 

### 🚀 1. Initialize Booking Payment
After creating a booking (e.g., getting `bookingId` 43), call this endpoint to get a secure Chapa payment link. The backend will configure split payouts automatically if the pension owner has registered their bank account.

- **URL**: `/payments/initialize-booking`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "bookingId": "43",
    "amount": "4800",
    "email": "customer@gmail.com",
    "firstName": "Abebe",
    "lastName": "Kebede",
    "phone": "+251912345678"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "data": {
      "checkout_url": "https://checkout.chapa.co/checkout/payment/..."
    },
    "paymentId": 15,
    "txRef": "BOOK-43-1716301200000"
  }
  ```
> **Action Required**: Open the `checkout_url` inside an in-app WebView or external browser for the customer to complete payment via Telebirr, CBEBirr, Cards, etc.

---

### 🔄 2. Verify Payment (Manual Handshake)
Once the payment flow returns the customer back to the mobile app (via `return_url`), the app should poll or hit this endpoint using the `txRef` to verify the payment and confirm the booking immediately.

- **URL**: `/payments/verify/:txRef`
- **Method**: `GET`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "data": {
      "status": "success",
      "reference": "BOOK-43-1716301200000",
      "amount": 4800,
      "pension_name": "Bole Luxury Pension"
    }
  }
  ```
