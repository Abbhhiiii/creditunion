/**
 * Test User Accounts & Profiles
 * Union Credit Real-World Test Data
 */

const testUsers = [
  {
    id: 'user-001',
    email: 'john.doe@example.com',
    password: 'password123',
    name: 'John Doe',
    phone: '555-0101',
    profile: {
      createdAt: '2024-01-15',
      riskScore: 'low',
      accountStatus: 'active'
    },
    accounts: [
      {
        id: 'acc-001-1',
        type: 'Checking',
        accountNumber: '****1234',
        balance: 5432.50,
        status: 'active',
        overdraftProtection: true
      },
      {
        id: 'acc-001-2',
        type: 'Savings',
        accountNumber: '****5678',
        balance: 15000.00,
        status: 'active',
        interestRate: 0.5
      }
    ],
    cards: [
      {
        id: 'card-001-1',
        type: 'Debit',
        last4: '1234',
        status: 'active',
        spendingLimit: 10000
      }
    ],
    loans: [
      {
        id: 'loan-001-1',
        type: 'Personal',
        principal: 10000,
        remaining: 5000,
        monthlyPayment: 500,
        daysOverdue: 0,
        status: 'active'
      }
    ],
    recentTransactions: [
      { date: '2026-04-24', amount: -250.50, description: 'Grocery Store', merchant: 'Whole Foods' },
      { date: '2026-04-23', amount: -1200.00, description: 'Rent Payment', merchant: 'Landlord' },
      { date: '2026-04-22', amount: 2500.00, description: 'Salary Deposit', merchant: 'Employer' }
    ]
  },
  {
    id: 'user-002',
    email: 'sarah.smith@example.com',
    password: 'password123',
    name: 'Sarah Smith',
    phone: '555-0102',
    profile: {
      createdAt: '2023-06-20',
      riskScore: 'medium',
      accountStatus: 'active'
    },
    accounts: [
      {
        id: 'acc-002-1',
        type: 'Checking',
        accountNumber: '****2345',
        balance: 3200.75,
        status: 'active',
        overdraftProtection: false
      },
      {
        id: 'acc-002-2',
        type: 'Money Market',
        accountNumber: '****6789',
        balance: 25000.00,
        status: 'active',
        interestRate: 1.2
      }
    ],
    cards: [
      {
        id: 'card-002-1',
        type: 'Credit',
        last4: '2345',
        status: 'active',
        creditLimit: 15000,
        currentBalance: 3500
      }
    ],
    loans: [],
    recentTransactions: [
      { date: '2026-04-24', amount: -450.00, description: 'Gas', merchant: 'Shell' },
      { date: '2026-04-21', amount: 5000.00, description: 'Bonus', merchant: 'Employer' }
    ]
  },
  {
    id: 'user-003',
    email: 'michael.johnson@example.com',
    password: 'password123',
    name: 'Michael Johnson',
    phone: '555-0103',
    profile: {
      createdAt: '2022-11-10',
      riskScore: 'low',
      accountStatus: 'active'
    },
    accounts: [
      {
        id: 'acc-003-1',
        type: 'Checking',
        accountNumber: '****3456',
        balance: 8750.25,
        status: 'active',
        overdraftProtection: true
      }
    ],
    cards: [
      {
        id: 'card-003-1',
        type: 'Debit',
        last4: '3456',
        status: 'blocked',
        spendingLimit: 5000
      }
    ],
    loans: [
      {
        id: 'loan-003-1',
        type: 'Home Equity',
        principal: 100000,
        remaining: 75000,
        monthlyPayment: 1200,
        daysOverdue: 0,
        status: 'active'
      }
    ],
    recentTransactions: [
      { date: '2026-04-24', amount: -1200.00, description: 'Mortgage', merchant: 'Servicer' },
      { date: '2026-04-20', amount: 6000.00, description: 'Salary', merchant: 'Employer' }
    ]
  },
  {
    id: 'user-004',
    email: 'emily.davis@example.com',
    password: 'password123',
    name: 'Emily Davis',
    phone: '555-0104',
    profile: {
      createdAt: '2024-03-05',
      riskScore: 'high',
      accountStatus: 'active_restricted'
    },
    accounts: [
      {
        id: 'acc-004-1',
        type: 'Checking',
        accountNumber: '****4567',
        balance: 450.00,
        status: 'active',
        overdraftProtection: false
      }
    ],
    cards: [
      {
        id: 'card-004-1',
        type: 'Credit',
        last4: '4567',
        status: 'suspended',
        creditLimit: 2000,
        currentBalance: 1950
      }
    ],
    loans: [
      {
        id: 'loan-004-1',
        type: 'Personal',
        principal: 5000,
        remaining: 4200,
        monthlyPayment: 300,
        daysOverdue: 45,
        status: 'delinquent'
      }
    ],
    recentTransactions: [
      { date: '2026-04-10', amount: -300.00, description: 'Payment', merchant: 'Self' },
      { date: '2026-03-15', amount: 800.00, description: 'Transfer In', merchant: 'Family' }
    ]
  },
  {
    id: 'user-005',
    email: 'robert.wilson@example.com',
    password: 'password123',
    name: 'Robert Wilson',
    phone: '555-0105',
    profile: {
      createdAt: '2021-08-12',
      riskScore: 'low',
      accountStatus: 'active'
    },
    accounts: [
      {
        id: 'acc-005-1',
        type: 'Premium Checking',
        accountNumber: '****5678',
        balance: 45000.00,
        status: 'active',
        overdraftProtection: true
      },
      {
        id: 'acc-005-2',
        type: 'Business Savings',
        accountNumber: '****9876',
        balance: 125000.00,
        status: 'active',
        interestRate: 2.5
      }
    ],
    cards: [
      {
        id: 'card-005-1',
        type: 'Credit Platinum',
        last4: '5678',
        status: 'active',
        creditLimit: 50000,
        currentBalance: 12000
      }
    ],
    loans: [],
    recentTransactions: [
      { date: '2026-04-24', amount: -5000.00, description: 'Business Expense', merchant: 'Vendor' },
      { date: '2026-04-22', amount: 15000.00, description: 'Business Income', merchant: 'Client' }
    ]
  },
  {
    id: 'user-006',
    email: 'jessica.martin@example.com',
    password: 'password123',
    name: 'Jessica Martin',
    phone: '555-0106',
    profile: {
      createdAt: '2023-02-18',
      riskScore: 'medium',
      accountStatus: 'active'
    },
    accounts: [
      {
        id: 'acc-006-1',
        type: 'Checking',
        accountNumber: '****6789',
        balance: 2100.50,
        status: 'active',
        overdraftProtection: true
      },
      {
        id: 'acc-006-2',
        type: 'Savings',
        accountNumber: '****3210',
        balance: 8500.00,
        status: 'active',
        interestRate: 0.5
      }
    ],
    cards: [
      {
        id: 'card-006-1',
        type: 'Debit',
        last4: '6789',
        status: 'active',
        spendingLimit: 8000
      }
    ],
    loans: [
      {
        id: 'loan-006-1',
        type: 'Student Loan',
        principal: 30000,
        remaining: 22000,
        monthlyPayment: 300,
        daysOverdue: 0,
        status: 'active'
      }
    ],
    recentTransactions: [
      { date: '2026-04-24', amount: -300.00, description: 'Student Loan', merchant: 'Servicer' },
      { date: '2026-04-23', amount: -200.00, description: 'Coffee', merchant: 'Starbucks' }
    ]
  },
  {
    id: 'user-007',
    email: 'david.anderson@example.com',
    password: 'password123',
    name: 'David Anderson',
    phone: '555-0107',
    profile: {
      createdAt: '2024-01-20',
      riskScore: 'low',
      accountStatus: 'active'
    },
    accounts: [
      {
        id: 'acc-007-1',
        type: 'Checking',
        accountNumber: '****7890',
        balance: 6500.00,
        status: 'active',
        overdraftProtection: true
      }
    ],
    cards: [
      {
        id: 'card-007-1',
        type: 'Debit',
        last4: '7890',
        status: 'active',
        spendingLimit: 7000
      }
    ],
    loans: [],
    recentTransactions: [
      { date: '2026-04-24', amount: -500.00, description: 'Utility Bill', merchant: 'Electric Co' },
      { date: '2026-04-22', amount: 3500.00, description: 'Salary', merchant: 'Employer' }
    ]
  },
  {
    id: 'user-008',
    email: 'anna.taylor@example.com',
    password: 'password123',
    name: 'Anna Taylor',
    phone: '555-0108',
    profile: {
      createdAt: '2023-09-01',
      riskScore: 'medium',
      accountStatus: 'active'
    },
    accounts: [
      {
        id: 'acc-008-1',
        type: 'Checking',
        accountNumber: '****8901',
        balance: 4200.75,
        status: 'active',
        overdraftProtection: false
      },
      {
        id: 'acc-008-2',
        type: 'Savings',
        accountNumber: '****1234',
        balance: 12000.00,
        status: 'active',
        interestRate: 0.75
      }
    ],
    cards: [
      {
        id: 'card-008-1',
        type: 'Credit',
        last4: '8901',
        status: 'active',
        creditLimit: 10000,
        currentBalance: 5000
      }
    ],
    loans: [
      {
        id: 'loan-008-1',
        type: 'Auto',
        principal: 25000,
        remaining: 18000,
        monthlyPayment: 450,
        daysOverdue: 0,
        status: 'active'
      }
    ],
    recentTransactions: [
      { date: '2026-04-24', amount: -450.00, description: 'Car Payment', merchant: 'Loan Servicer' },
      { date: '2026-04-20', amount: 4000.00, description: 'Salary', merchant: 'Employer' }
    ]
  },
  {
    id: 'user-009',
    email: 'christopher.white@example.com',
    password: 'password123',
    name: 'Christopher White',
    phone: '555-0109',
    profile: {
      createdAt: '2022-12-10',
      riskScore: 'low',
      accountStatus: 'active'
    },
    accounts: [
      {
        id: 'acc-009-1',
        type: 'Checking',
        accountNumber: '****9012',
        balance: 11200.00,
        status: 'active',
        overdraftProtection: true
      }
    ],
    cards: [
      {
        id: 'card-009-1',
        type: 'Debit',
        last4: '9012',
        status: 'active',
        spendingLimit: 12000
      }
    ],
    loans: [],
    recentTransactions: [
      { date: '2026-04-24', amount: -1500.00, description: 'Transfer Out', merchant: 'Investment' },
      { date: '2026-04-22', amount: 5000.00, description: 'Salary', merchant: 'Employer' }
    ]
  },
  {
    id: 'user-010',
    email: 'sophia.brown@example.com',
    password: 'password123',
    name: 'Sophia Brown',
    phone: '555-0110',
    profile: {
      createdAt: '2024-02-14',
      riskScore: 'high',
      accountStatus: 'active_restricted'
    },
    accounts: [
      {
        id: 'acc-010-1',
        type: 'Checking',
        accountNumber: '****0123',
        balance: 800.00,
        status: 'active',
        overdraftProtection: false
      }
    ],
    cards: [
      {
        id: 'card-010-1',
        type: 'Debit',
        last4: '0123',
        status: 'active',
        spendingLimit: 2000
      }
    ],
    loans: [
      {
        id: 'loan-010-1',
        type: 'Payday',
        principal: 500,
        remaining: 500,
        monthlyPayment: 500,
        daysOverdue: 30,
        status: 'delinquent'
      }
    ],
    recentTransactions: [
      { date: '2026-04-15', amount: -500.00, description: 'Payment Attempt', merchant: 'Self' },
      { date: '2026-03-20', amount: 600.00, description: 'Payday Loan', merchant: 'Lender' }
    ]
  }
];

module.exports = testUsers;
