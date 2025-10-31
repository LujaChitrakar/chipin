# Chippin Mobile App

A modern, intuitive mobile application for expense splitting and peer-to-peer USDC payments built with React Native and Expo.

## Overview

Chippin's mobile app provides a seamless interface for managing shared expenses, splitting bills, and sending USDC payments directly to friends on the Solana blockchain without the hassle of copying wallet addresses or switching to external payment apps.

## Core Features & User Flow

### 🔐 Authentication & Onboarding

**Initial Setup:**
- Users launch the app
- Privy authentication handles wallet connection
- Users can authenticate using various email
- First-time users are asked to enter referal code if referred by a friend.
- Existing users are logged in automatically if session is valid

**Flow:**
1. User opens app for first time
2. User enters his/her email
3. Fills up the otp sent to email
4. User logs in successfully

### 👥 Friend Management

**Discovering & Adding Friends:**

**Method 1 - Search & Request:**
- Users can search for friends by username or email
- Receipent Can accept or reject from notifications or friends tab

**Method 2 - QR Code (Preferred):**
- Each user has a unique QR code in their profile
- Other users open camera scanner from friends tab
- Scan QR code → instant friend request sent
- No typing needed, works great for in-person connections

**Managing Friends:**
- Friends list shows all connections with recent activity
- Tap friend to view profile, transaction history
- Option to unfriend or view mutual groups
- See pending requests (sent and received)

**Flow:**
1. User A taps "Add Friend" button
2. Options appear: "Scan QR Code" or "Search"
3. User A selects "Scan QR Code"
4. Camera opens with scanner overlay
5. User A scans User B's QR code from their profile
6. Friend request automatically sent to User B
7. User B receives push notification
8. User B opens notifications, sees request from User A
9. User B taps "Accept" → both are now friends
10. Both users see each other in friends list

### 🏦 Group Management

**Creating Groups:**
- Tap "Create Group" from groups tab
- Enter group name (e.g., "Thailand Trip 2025")
- Optional: add group description
- Add initial members from friends list
- Group is created with you as admin

**Joining Groups:**

**Method 1 - Admin Addition:**
- Group admin adds you directly from their friends list


**Method 2 - Email Invitation:**
- Admin enters your email address
- You receive email with invitation link
- Click link → opens app and signing up auto-joins group
- Works even if you're not signed up yet

**Method 3 - QR Code:**
- Anyone in the group can share group QR code
- You scan QR code from "Join Group" option
- Instant join

**Method 4 - Group Code:**
- Group member shares 6-8 character group code
- You tap "Join Group" → "Enter Code"
- Enter code and join instantly

**Group Features:**
- View all members and their balances
- Access group expenses chronologically
- Admin controls: add/remove members, edit group details

**Flow - Creating & Joining:**
1. User A creates group "Roommates 2025"
2. Adds User B directly from friends
3. Generates group QR code and shares on group chat
4. User C scans QR code from group chat
5. User C auto-joins the group
6. All three users now see the same group with expenses

### 💰 Expense Tracking & Settlement

**Adding Expenses:**
- From group screen, tap "Add Expense"
- Enter description (e.g., "Groceries")
- Enter total amount
- Select who paid (defaults to you)
- Select participants who should split the cost
 to each person
- Tap "Add" → expense is recorded

**Viewing Balances:**
- Group screen shows summary: "You owe $45" or "You're owed $30"
- Tap "View Balances" to see detailed breakdown
- Shows who owes whom and exact amounts
- Green = others owe you, Red = you owe others

**Settling Balances:**
- Tap "Settle" on balance tab
- Transaction is broadcast to Solana
- Balance updates to $0 for that person
- Settlement is recorded in activity history

**Flow:**
1. Group of 4 friends goes to dinner, bill is $100
2. User A pays the full $100 bill
3. User A opens Chippin, navigates to "Dinner Group"
4. Taps "Add Expense"
5. Enters: "Dinner at Italian Place", $100
6. Splits equally among all 4
7. System calculates: User B, C, D each owe $25
8. User B opens app, sees "You owe $25" on group screen
9. User B taps "Settle Up" → selects User A
12. Transaction processes on Solana blockchain
13. Both are displayed "Settled"
14. Group balance updates: User C and D still owe $25 each

### 💸 Direct Payments

**Sending Money to Friends:**
- Navigate to Home page
- Click on Send button
- Enter amount in USDC
- Add optional purpose
- Click Send and Done

**QR Code Payment:**
- Tap "Send By QR"
- Camera opens with QR scanner
- Scan friend's or merchant's wallet QR code
- App decodes wallet address
- Enter amount and confirm
- Transaction is sent

**Manual Address Entry:**
- Tap "Send Direct" and "Public Key"
- Paste or type Solana wallet address
- App validates address format
- Enter amount and confirm
- Useful for sending to external wallets

### 🤝 Lending & Borrowing

**Lending Money (Direct):**
- Navigate to Lending tab
- Tap "Lend Money"
- Select friend from list
- Enter amount
- Optional: enter purpose
- Confirm → USDC is sent immediately
- Loan is tracked in "Money Lent" section
- Friend sees it in their "Money Borrowed" section

**Borrowing Money (Request):**
- Navigate to Lending tab
- Tap "Request to Borrow"
- Select friend you want to borrow from
- Enter amount needed
- Add reason/purpose (required)
- Optional: suggest repayment date
- Send request
- Friend receives notification with request details
- Friend can accept (sends USDC) or reject with message

**Tracking & Management:**
- "Money Lent" section shows:
  - List of active loans you've given
  - Amount, borrower name, due date
  - Status: on time, overdue
  - Option to send reminder or mark as repaid
- "Money Borrowed" section shows:
  - List of active loans you owe
  - Amount, lender name, due date
  - Quick "Repay Now" button
  - Payment history for partial repayments

**Flow - Borrowing:**
1. User B needs 200 USDC urgently
2. Opens Lending tab → "Request to Borrow"
3. Selects User A from friends
4. Enters: Amount: 200 USDC, Reason: "Medical emergency"
5. Suggests repayment: 1 month from today
6. Sends request
7. User A receives notification: "Borrow request from User B"
8. Opens request, sees amount and reason
9. Reviews User B's profile and history
10. Taps "Accept & Lend"
11. Confirms transaction
12. 200 USDC is sent to User B instantly
13. Loan tracked for both users
14. User B gets notification: "200 USDC received from User A"
15. After 1 month, User B repays from "Money Borrowed" screen

### 🎁 Rewards & Referrals

**Accessing Referral Code:**
- Navigate to Profile tab
- Tap "Rewards & Referrals"
- View your unique referral code and QR code
- See current points balance
- View progress to next cashback milestone

**Sharing Referrals:**
- Tap "Share Referral" button
- Options: Share QR code image, Copy referral code, Share via social media
- When friend signs up and enter the code
- Points are awarded to both.

**Points & Cashback:**
- Dashboard shows: "8,450 / 10,000 points to next cashback"
- Progress bar visualizes milestone
- When reaching 10,000 points:
  - Redeem button is enabled
  - Cashback credited to wallet instantly
  - Next milestone goes up by next 10,000, new cycle begins
- View cashback history and total earnings

**Flow:**
1. User A navigates to Rewards section
2. Taps "Share Referral"
3. Sends referral QR to friend via WhatsApp
4. Friend scans QR → Chippin app download page
5. Friend installs app and signs up
6. Friend makes first payment of 10 USDC
7. User A receives notification: "You earned 100 points!"
8. User A's point balance: 9,100 → 9,200
9. After 8 more successful referrals (800 points):
10. User A reaches 10,000 points
11. Notification: "Congratulations! 20 USDC cashback"
12. Wallet balance increases by 20 USDC
13. Points reset, new progress bar starts

### 📊 Activity Feed

**Real-Time Activity Tracking:**
- Home screen shows recent activities at the top
- Dedicated Activities tab for complete history
- Activities auto-refresh when new actions occur
- Push notifications for important activities

**Activity Types:**
- 💳 **Expenses**: "You added expense 'Lunch' in Roommates group"
- 💸 **Payments**: "You sent 50 USDC to John"
- 🤝 **Settlements**: "Mike settled up $35 with you"
- 👥 **Friends**: "Sarah accepted your friend request"
- 🏦 **Groups**: "You joined 'Office Lunch' group"
- 💰 **Lending**: "You lent 100 USDC to Alex"
- 📨 **Borrowing**: "Emma sent you a borrow request"
- 🎁 **Rewards**: "You earned 100 points from referral"
- 💵 **Cashback**: "You received 20 USDC cashback"

**Filtering & Search:**
- Filter by activity type
- Filter by date range
- Filter by specific group or friend
- Search by keyword or amount

**Activity Details:**
- Tap any activity to view full details
- See transaction hash for blockchain transactions
- View related group or friend profile
- Access related receipts or photos

**Flow:**
1. User opens app → Home screen loads
2. "Recent Activities" section shows last few activities
3. Latest activity: "John settled $25 with you - 2 min ago"
4. User taps on activity
5. Detail view shows:
   - Transaction type: Settlement
   - Amount: 25 USDC
   - From: John Doe
   - Time: 2:34 PM
   - Transaction hash: [blockchain link]
   - Related group: "Weekend Trip"
6. User can tap transaction hash to view on Solana Explorer
7. User navigates to Activities tab
8. Sees complete history scrollable list
9. Filters by "Last 7 days" and "Payments only"
10. Views all payments made/received this week

## Major Dependencies

**Framework:**
- **Expo SDK 54**: Development framework and build toolchain
- **React Native 0.81**: Core mobile framework
- **Expo Router 6.0**: File-based navigation system

**Blockchain Integration:**
- **@solana/web3.js**: Solana blockchain operations
- **@solana/spl-token**: USDC token transfers and balance checks
- **bs58**: Wallet address encoding/decoding

**Authentication:**
- **@privy-io/expo**: Wallet authentication and management
- **expo-secure-store**: Secure credential storage

**UI & Interaction:**
- **lucide-react-native**: Icon library
- **react-native-reanimated**: Animations
- **react-native-gesture-handler**: Touch gesture handling

**Camera & QR:**
- **expo-camera**: Camera access
- **react-native-camera-kit**: QR code scanning
- **react-native-qrcode-svg**: QR code generation

**Data Management:**
- **@tanstack/react-query**: Server state management and caching
- **axios**: HTTP client for API calls

**Utilities:**
- **expo-clipboard**: Copy/paste functionality
- **expo-linking**: Deep linking for invites
- **react-native-image-picker**: Image upload

## Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Platform Support

- **Android**: API level 21 (Android 5.0) and above


## License

MIT License

## Support

For help or questions: support@chippin.app