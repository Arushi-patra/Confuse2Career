Absolutely. Since you want to give this directly to **Figma Make**, the prompt should be very explicit about **navigation, existing-page preservation, form behavior, profile states, and the blue-only palette change**.

Here is a polished prompt you can paste into Figma Make:

Update the existing website design and functionality according to the following requirements. **Do not redesign the entire project or change the existing layout unnecessarily. Preserve the current dashboard, components, spacing, typography, cards, icons, and overall visual style unless specifically mentioned below.**

## 1. Add a Login Page

Create a new **Login Page** for the website.

### Login Page Content

Include:

* Email input field
* Password input field
* Show/hide password icon
* "Login" button
* Optional "Forgot Password?" link if it fits the existing authentication design

### Navigation

* When the user clicks the existing **Login** button anywhere on the landing page/navigation, navigate to the new Login Page.
* After successful login, navigate to the **Profile Page**.
* The first-time logged-in user must complete their profile before accessing the Dashboard.

The Login Page should visually match the existing website design.

---

# 2. Replace the Existing Onboarding Page with Profile Page

**Completely replace the existing Onboarding Page with a Profile Page.**

Do not create a separate onboarding flow.

The Profile Page should be the page shown immediately after a user's first successful login.

Create a clean, modern, glassmorphism-style profile form that matches the existing website.

## Profile Form Fields

The following fields are **COMPULSORY**:

1. Full Name
2. Email
3. College
4. Branch
5. Year
6. Placement Date
7. Study Hours Per Day
8. Dream Company
9. Target Role
10. Upload Resume
11. GitHub Profile Link 

Clearly indicate required fields using `*`.

### Field Details

**Full Name**

* Text input
* Example: Arjun Sharma

**Email**

* Email input
* Automatically populate this with the email used during login if possible
* Allow the user to edit it if required

**College**

* Text input

**Branch**

* Dropdown/select
* Example options:

  * Computer Science & Engineering
  * Information Technology
  * Electronics & Communication
  * Electrical Engineering
  * Mechanical Engineering
  * Other

**Year**

* Dropdown/select
* Example:

  * 1st Year
  * 2nd Year
  * 3rd Year
  * 4th Year

**Placement Date**

* Date picker

**Study Hours Per Day**

* Number input or suitable selector
* Example: 2, 4, 6, 8,.... hours

**Dream Company**

* Dropdown/select or searchable input
* Example: Google, Microsoft, Amazon,** Adobe, Meta, Flipkart, Infosys, TCS, Wipro, Cognizant, Accenture, Capgemini, Oracle, Salesforce, VMware, Intel, Qualcomm, Nvidia, Samsung, IBM, Dell, HP, Cisco, Uber, Lyft, Airbnb, Spotify, Netflix, Twitter, Snapchat**

**Target Role**

* Dropdown/select or searchable input
* Examples:

  * Software Developer
  * Full Stack Developer
  * Data Analyst
  * Data Scientist
  * AI/ML Engineer
  * Cloud Engineer
  * Cybersecurity Engineer
  * Other

**Upload Resume**

* File upload component
* Accept PDF/DOC/DOCX
* Show uploaded filename after selection
* Include a clear upload icon/button

**GitHub Link **

* URL input
* Example: [https://github.com/username](https://github.com/username)

---

# 3. Optional Coding Platform Section in Profile page

Add a separate section called:

### Coding Profiles

The user can optionally provide **ONE** of the following:

* LeetCode Profile Link
* OR
* HackerRank Profile Link

This section is **OPTIONAL**.

Use a radio button, segmented control, or similar UI so the user chooses either:

`LeetCode` OR `HackerRank`

Then display the corresponding URL input.

The user should be allowed to skip this section completely.

Do NOT make these fields compulsory.

---

# 4. Profile Completion

At the bottom of the Profile Page add a prominent:

**"Complete Profile"** / **"Continue to Dashboard"** button.

Behavior:

* Do not allow the user to continue if any compulsory field is empty.
* Show clear inline validation messages for missing/invalid fields.
* Optional LeetCode/HackerRank fields should never prevent submission.
* After successfully completing the profile, navigate to the **existing Dashboard Page**.
* Do NOT create a new dashboard. Use the dashboard that already exists in the project.

The profile should feel like an important setup step but should remain visually clean and not overly long.

---

# 5. Dashboard Profile Button

Modify the existing Dashboard layout.

In the **top-left corner** of the dashboard, add a small profile/avatar button.

For example, if the user's name is:

**Arjun**

show:

`A`

inside a rounded square/box or avatar.

If the name is:

**Arjun Sharma**

still show:

`A`

Use the first letter of the user's name dynamically.

### Profile Button Behavior

When the user clicks the avatar/name button:

→ Navigate to the Profile Page.

This should work when the user is already logged in and has already completed their profile.

Do not create a duplicate profile page.

---

# 6. Profile Page for Existing Users

The Profile Page must support two states:

### First-Time User

After login:

Login → Profile → Dashboard

The user fills in all required information and submits the profile.

### Existing Logged-In User

Dashboard → Click Profile Avatar → Profile

In this case, display all previously saved profile information.

Instead of only showing a submission button, provide:

**"Edit Profile"**

button.

When the user clicks **Edit Profile**:

* Make the fields editable.
* Allow the user to change any profile information.
* Allow the user to replace/update their resume.
* Allow them to update GitHub.
* Allow them to change their LeetCode/HackerRank profile.
* Provide a **"Save Changes"** button.

After saving:

→ Return to the Dashboard.

Do not force the user to complete onboarding again.

---

# 7. Dynamic User Information

The profile data should be reflected throughout the UI where appropriate.

For example:

If the user enters:

Name: Arjun Sharma

The dashboard profile avatar should automatically display:

`A`

The profile page should display:

`Arjun Sharma`

Use dynamic user data rather than hardcoded names.

---

# 8. Major Visual Change — Purple → Blue

This is a **major global design change**.

The existing project currently uses a purple-based color palette.

### Replace the purple palette with BLUE shades.

Use a modern blue color system such as:

* Deep Navy Blue
* Dark Blue
* Royal Blue
* Electric Blue
* Sky Blue
* Light Blue
* Blue-tinted transparent glass

The design should feel:

* Modern
* Professional
* Futuristic
* Clean
* Premium
* AI/technology-oriented

### IMPORTANT:

**Do NOT change the other existing colors unnecessarily.**

Only replace the existing purple-related colors with appropriate blue equivalents.

Preserve:

* White
* Black
* Gray
* Neutral backgrounds
* Existing text colors
* Existing borders
* Existing shadows
* Existing accent colors that are NOT purple

Do not introduce random new colors.

---

# 9. Preserve Existing Glassmorphism Design

The project should maintain and improve its existing **glassmorphism aesthetic**.

For the new Login and Profile pages use:

* Semi-transparent cards
* Subtle backdrop blur
* Soft borders
* Subtle shadows
* Blue glow effects
* Rounded corners
* Layered backgrounds
* Clean spacing

Avoid making the interface look flat or basic.

The Login and Profile pages should visually belong to the same design system as the existing Dashboard and Landing Page.

---

# 10. Navigation Flow

Implement this overall navigation structure:

Landing Page
↓
Login
↓
Profile
↓
Dashboard

For existing users:

Dashboard
↓
Profile
↓
Edit Profile
↓
Save Changes
↓
Dashboard

The profile avatar should always be accessible from the Dashboard.

---

# 11. Form UX ( single page form)

Make the Profile form easy to understand.

Group related fields into sections:

### Personal Information

* Name
* Email

### Academic Information

* College
* Branch
* Year

### Career & Placement

* Placement Date
* Study Hours
* Dream Company
* Target Role

### Professional Profiles

* Resume
* GitHub

### Coding Profiles — Optional

* LeetCode OR HackerRank

Use appropriate icons where they improve usability.

Use clear labels above inputs.

Do not rely only on placeholder text for field labels.

---

# 12. Responsive Design

Make the Login and Profile pages responsive for:

* Desktop
* Laptop
* Tablet
* Mobile

On desktop, the Profile form can use a two-column layout where appropriate.

On smaller screens, automatically switch to a single-column layout.

Do not make the form excessively wide.

---

# 13. Important Implementation Rules

1. Do NOT remove the existing Dashboard.
2. Do NOT redesign the existing Dashboard unnecessarily.
3. Do NOT create a second Dashboard.
4. Replace the existing Onboarding Page with the Profile Page.
5. Add the new Login Page.
6. Connect the Login → Profile → Dashboard navigation.
7. Add the profile avatar to the Dashboard top-left corner.
8. Make the avatar dynamically display the first letter of the user's name.
9. Allow existing users to open and edit their profile.
10. Required profile fields must be validated.
11. LeetCode/HackerRank must remain optional.
12. Preserve the existing typography and general design language.
13. Change the primary purple palette to blue shades throughout the project.
14. Do not change unrelated colors.
15. Maintain the existing glassmorphism aesthetic.
16. Reuse existing components whenever possible instead of creating unnecessary duplicates.
17. Keep the existing project structure and functionality intact unless a change is explicitly required above.

## Final User Flow

### New User:

Landing → Login → Profile Setup → Dashboard

### Returning User:

Login → Dashboard

### Profile Editing:

Dashboard → Profile Avatar → Profile → Edit Profile → Save Changes → Dashboard

The final result should look like a polished **AI-powered career/placement platform**, with a sophisticated blue glassmorphism visual identity rather than the previous purple theme.
