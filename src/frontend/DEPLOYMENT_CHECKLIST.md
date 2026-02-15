# Birthday Buddy - Deployment Checklist

Use this checklist to verify a successful production deployment to the Internet Computer.

## Pre-Deployment

- [ ] All code changes committed and tested
- [ ] Dependencies installed (`pnpm install`)
- [ ] DFX CLI installed and up to date
- [ ] Internet Computer wallet configured with sufficient cycles
- [ ] Authenticated with DFX (`dfx identity whoami`)

## Build Phase

- [ ] Backend builds without errors (`dfx build backend --network ic`)
- [ ] Frontend builds without errors (`dfx build frontend --network ic`)
- [ ] No TypeScript compilation errors
- [ ] No linting errors

## Deployment Phase

- [ ] Backend canister deploys successfully
- [ ] Frontend canister deploys successfully
- [ ] Canister IDs recorded (especially frontend canister ID)
- [ ] Deployment completes without errors

## Post-Deployment Verification

### Basic Functionality
- [ ] Application loads in browser at `https://<canister-id>.icp0.io`
- [ ] No console errors on initial load
- [ ] Landing page displays correctly
- [ ] Header and footer render properly

### Authentication
- [ ] Login button is visible and clickable
- [ ] Internet Identity authentication flow works
- [ ] User can successfully log in
- [ ] User can successfully log out
- [ ] Profile setup modal appears for new users
- [ ] User profile is saved and persists

### Core Features
- [ ] **Contacts Tab**
  - [ ] Can add new contacts
  - [ ] Can edit existing contacts
  - [ ] Can delete contacts
  - [ ] Contact list displays correctly
  - [ ] Search functionality works

- [ ] **Upcoming Tab**
  - [ ] Upcoming birthdays display correctly
  - [ ] Time window filters work (7/30/90 days)
  - [ ] Today's birthdays highlighted
  - [ ] Age calculations are correct
  - [ ] Search functionality works

- [ ] **Gifts Tab**
  - [ ] Can create new gift plans
  - [ ] Can edit existing gift plans
  - [ ] Can delete gift plans
  - [ ] Status workflow works (Planned → Ordered → Sent)
  - [ ] Yearly recurring toggle works
  - [ ] Gift plans display with correct contact names

### UI/UX
- [ ] Responsive design works on mobile
- [ ] Responsive design works on tablet
- [ ] Responsive design works on desktop
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Theme toggle works (if implemented)
- [ ] All buttons and interactive elements are clickable
- [ ] Loading states display during operations
- [ ] Error messages display appropriately

### Data Persistence
- [ ] Data persists after logout/login
- [ ] Data persists after browser refresh
- [ ] Multiple users can use the app independently
- [ ] User data is isolated (users can't see each other's data)

### Performance
- [ ] Initial page load is reasonable (< 5 seconds)
- [ ] Navigation between tabs is smooth
- [ ] No memory leaks observed
- [ ] No excessive network requests

## URL Verification

- [ ] Frontend canister ID extracted successfully
- [ ] Live URL format is correct: `https://<canister-id>.icp0.io`
- [ ] URL is NOT a caffeine.xyz draft URL
- [ ] URL is accessible from different networks/devices
- [ ] URL can be shared and accessed by others

## Documentation

- [ ] Live URL documented and shared with stakeholders
- [ ] Canister IDs recorded in project documentation
- [ ] Deployment date and version noted
- [ ] Any deployment issues documented

## Final Checks

- [ ] Application is fully functional
- [ ] No critical bugs identified
- [ ] Ready for user access
- [ ] Monitoring/alerting configured (if applicable)

---

**Deployment Date:** _________________

**Frontend Canister ID:** _________________

**Live URL:** _________________

**Deployed By:** _________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
