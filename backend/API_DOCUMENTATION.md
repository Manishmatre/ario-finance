# Bank Account API Documentation

## Overview
The Bank Account API provides endpoints for managing bank accounts in the SSK Finance Management system. All endpoints require authentication and tenant context.

## Base URL
```
https://SSKfinance-backend.onrender.com/api/finance/bank-accounts
```

## Authentication
All requests must include a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Bank Accounts
**GET** `/api/finance/bank-accounts`

Retrieves all bank accounts for the current tenant with pagination and filtering.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of records per page (default: 10)
- `status` (optional): Filter by status (active, inactive, dormant, frozen)
- `type` (optional): Filter by account type
- `bankName` (optional): Filter by bank name

#### Response
```json
{
  "bankAccounts": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "bankName": "HDFC",
      "type": "Current",
      "accountHolder": "SSKnex Technologies Pvt Ltd",
      "bankAccountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "branchName": "Koramangala Branch",
      "currentBalance": 2500000,
      "status": "active",
      "interestRate": 0,
      "features": {
        "internetBanking": true,
        "mobileBanking": true,
        "debitCard": true,
        "chequeBook": true
      },
      "notes": "Main business account",
      "accountCode": "HDCUC123456",
      "tenantId": "demo-tenant-1",
      "createdBy": "system",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  },
  "summary": {
    "totalAccounts": 5,
    "totalBalance": 11750000,
    "activeAccounts": 5
  }
}
```

### 2. Get Bank Account Statistics
**GET** `/api/finance/bank-accounts/stats`

Retrieves comprehensive statistics about bank accounts.

#### Response
```json
{
  "summary": {
    "totalAccounts": 5,
    "totalBalance": 11750000,
    "activeAccounts": 5,
    "inactiveAccounts": 0,
    "dormantAccounts": 0,
    "frozenAccounts": 0
  },
  "accountsByType": [
    {
      "_id": "Current",
      "count": 2,
      "totalBalance": 3250000
    },
    {
      "_id": "Savings",
      "count": 1,
      "totalBalance": 1500000
    }
  ],
  "accountsByBank": [
    {
      "_id": "HDFC",
      "count": 1,
      "totalBalance": 2500000
    },
    {
      "_id": "SBI",
      "count": 1,
      "totalBalance": 1500000
    }
  ]
}
```

### 3. Get Single Bank Account
**GET** `/api/finance/bank-accounts/:id`

Retrieves a specific bank account by ID.

#### Response
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "bankName": "HDFC",
  "type": "Current",
  "accountHolder": "SSKnex Technologies Pvt Ltd",
  "bankAccountNo": "1234567890",
  "ifsc": "HDFC0001234",
  "branchName": "Koramangala Branch",
  "currentBalance": 2500000,
  "status": "active",
  "interestRate": 0,
  "features": {
    "internetBanking": true,
    "mobileBanking": true,
    "debitCard": true,
    "chequeBook": true
  },
  "notes": "Main business account",
  "accountCode": "HDCUC123456",
  "tenantId": "demo-tenant-1",
  "createdBy": "system",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Create Bank Account
**POST** `/api/finance/bank-accounts`

Creates a new bank account.

#### Request Body
```json
{
  "bankName": "HDFC",
  "type": "Current",
  "accountHolder": "SSKnex Technologies Pvt Ltd",
  "bankAccountNo": "1234567890",
  "ifsc": "HDFC0001234",
  "branchName": "Koramangala Branch",
  "currentBalance": 2500000,
  "status": "active",
  "interestRate": 0,
  "features": {
    "internetBanking": true,
    "mobileBanking": true,
    "debitCard": true,
    "chequeBook": true
  },
  "notes": "Main business account"
}
```

#### Required Fields
- `bankName`: Bank name (enum: SBI, HDFC, ICICI, Axis, Kotak, Yes Bank, PNB, Canara, Bank of Baroda, Union Bank, Other)
- `type`: Account type (enum: Current, Savings, Fixed Deposit, Recurring Deposit, NRE, NRO, Other)
- `accountHolder`: Account holder name (min: 2 characters)
- `bankAccountNo`: Bank account number (min: 5 characters)
- `ifsc`: IFSC code (format: 4 letters + 0 + 6 alphanumeric)
- `branchName`: Branch name (min: 2 characters)

#### Optional Fields
- `currentBalance`: Current balance (default: 0, min: 0)
- `status`: Account status (enum: active, inactive, dormant, frozen, default: active)
- `interestRate`: Interest rate (0-100, only for interest-bearing accounts)
- `features`: Account features object
- `notes`: Additional notes (max: 500 characters)

#### Response
```json
{
  "message": "Bank account created successfully",
  "bankAccount": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "bankName": "HDFC",
    "type": "Current",
    "accountHolder": "SSKnex Technologies Pvt Ltd",
    "bankAccountNo": "1234567890",
    "ifsc": "HDFC0001234",
    "branchName": "Koramangala Branch",
    "currentBalance": 2500000,
    "status": "active",
    "interestRate": 0,
    "features": {
      "internetBanking": true,
      "mobileBanking": true,
      "debitCard": true,
      "chequeBook": true
    },
    "notes": "Main business account",
    "accountCode": "HDCUC123456",
    "tenantId": "demo-tenant-1",
    "createdBy": "system",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Update Bank Account
**PUT** `/api/finance/bank-accounts/:id`
**PATCH** `/api/finance/bank-accounts/:id`

Updates an existing bank account.

#### Request Body
Same as create, but all fields are optional.

#### Response
```json
{
  "message": "Bank account updated successfully",
  "bankAccount": {
    // Updated bank account object
  }
}
```

### 6. Delete Bank Account
**DELETE** `/api/finance/bank-accounts/:id`

Soft deletes a bank account by setting status to 'inactive'.

#### Response
```json
{
  "message": "Bank account deleted successfully",
  "bankAccount": {
    // Bank account object with status: "inactive"
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "error": "Missing required fields",
  "required": ["bankName", "type", "accountHolder", "bankAccountNo", "ifsc", "branchName"]
}
```

### IFSC Format Error (400)
```json
{
  "error": "Invalid IFSC code format. Must be 11 characters: 4 letters + 0 + 6 alphanumeric"
}
```

### Duplicate Account Error (400)
```json
{
  "error": "Bank account number already exists"
}
```

### Not Found Error (404)
```json
{
  "error": "Bank account not found"
}
```

### Server Error (500)
```json
{
  "error": "Failed to create bank account"
}
```

## Data Models

### Bank Account Schema
```javascript
{
  bankName: String (required, enum),
  type: String (required, enum),
  accountHolder: String (required, min: 2),
  bankAccountNo: String (required, min: 5),
  ifsc: String (required, format: /^[A-Z]{4}0[A-Z0-9]{6}$/),
  branchName: String (required, min: 2),
  currentBalance: Number (required, min: 0, default: 0),
  status: String (required, enum, default: 'active'),
  interestRate: Number (min: 0, max: 100, default: 0),
  features: {
    internetBanking: Boolean (default: false),
    mobileBanking: Boolean (default: false),
    debitCard: Boolean (default: false),
    chequeBook: Boolean (default: false)
  },
  notes: String (max: 500),
  accountCode: String (auto-generated, unique),
  tenantId: String (required),
  createdBy: String (required),
  lastTransactionDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Enums

### Bank Names
- SBI (State Bank of India)
- HDFC (HDFC Bank)
- ICICI (ICICI Bank)
- Axis (Axis Bank)
- Kotak (Kotak Mahindra Bank)
- Yes Bank
- PNB (Punjab National Bank)
- Canara (Canara Bank)
- Bank of Baroda
- Union Bank (Union Bank of India)
- Other

### Account Types
- Current
- Savings
- Fixed Deposit
- Recurring Deposit
- NRE (Non-Resident External)
- NRO (Non-Resident Ordinary)
- Other

### Account Status
- active
- inactive
- dormant
- frozen

## Features

### Auto-generated Account Code
The system automatically generates a unique account code in the format: `{BANK_CODE}{TYPE_CODE}{TIMESTAMP}`

Example: `HDCUC123456` (HDFC Current Account with timestamp)

### Interest-bearing Account Types
The following account types support interest rates:
- Savings
- Fixed Deposit
- Recurring Deposit
- NRE
- NRO

### Validation Rules
- IFSC code must follow RBI format: 4 letters + 0 + 6 alphanumeric
- Account number must be at least 5 characters
- Account holder name must be at least 2 characters
- Branch name must be at least 2 characters
- Interest rate must be between 0-100 for interest-bearing accounts
- Notes must be less than 500 characters

### Tenant Isolation
All bank accounts are isolated by tenant ID, ensuring data security and multi-tenancy support.

## Usage Examples

### Frontend Integration
```javascript
// Create a new bank account
const createBankAccount = async (bankAccountData) => {
  const response = await fetch('/api/finance/bank-accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bankAccountData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
};

// Get all bank accounts with pagination
const getBankAccounts = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/finance/bank-accounts?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
``` 