# **Design Specification: Student Management System**

## **1. Project Overview**
The Student Management System is a lightweight, responsive web application designed to handle the end-to-end lifecycle of student records. The system is split across three primary interfaces: a master list dashboard, a multi-step data entry form, and a detailed read-only profile view. 

## **2. Design System & Theming**
The application relies on **Tailwind CSS** for its utility-first styling, heavily utilizing the `slate` color palette for a clean, professional, and corporate aesthetic. 

### **Color Palette**
* **Primary (Brand/Action):** Blue (`blue-500` to `blue-700`). Used for primary buttons, progress bar fills, active states, and focus rings.
* **Neutral (Typography & Structure):** Slate (`slate-50` to `slate-900`). Used for backgrounds, text, borders, and disabled elements.
* **Success (Positive States):** Green (`green-100` backgrounds, `green-700` text). Used for completed fee statuses and edit action hovers.
* **Danger (Destructive/Errors):** Red (`red-100` backgrounds, `red-500` to `red-700` text/borders). Used for pending fee statuses, delete actions, required field asterisks, and validation error messages.

### **Typography & Layout**
* **Font:** Default Tailwind Sans-serif.
* **Hierarchy:** * Page Titles: `3xl` to `4xl`, bold, `slate-900`.
    * Section Headings: `2xl`, semi-bold.
    * Labels/Table Headers: `14px` (`text-sm`), uppercase tracking for tables, standard for form labels.
* **Containers:** Content is housed in card-like containers (`.container`, `.section-container`) featuring soft slate backgrounds (`bg-slate-50/50`), subtle borders, rounded corners (`rounded-xl` or `rounded-2xl`), and light shadow to elevate them from the background.

---

## **3. Page Specifications**

### **A. Dashboard / Student List (`index.html`)**
**Purpose:** The central hub for viewing, searching, and managing the student directory.
* **Top Bar Actions:**
    * **Search:** Real-time text input with an embedded search icon.
    * **Add Student:** Prominent primary blue button redirecting to the multi-step form.
* **Filter & Sort Ribbon:**
    * **Filters:** Dropdowns for Class, Gender, and Fee Status. Includes a "Reset All" utility link.
    * **Sorting:** Sort by Admission Number or Student Name, with an ascending/descending toggle icon.
    * **Export:** Two icon-only buttons for exporting the current view to Excel or CSV.
* **Data Table:**
    * **Columns:** Admission No, Student Name (with avatar), Class, Division, Roll No, Gender, Mobile, Fee Status, and Actions.
    * **Row Interactions:** Hover state changes background to `#f3f7fa`.
    * **Action Column:** Icon buttons for **Edit** (Green hover), **Delete** (Red hover, triggers a confirmation modal), and **View Info** (Blue hover).
* **Pagination:** Footer controls displaying current rows ("Showing X-Y of Z"), a "Rows per page" selector (10, 25, 50, 100), and Next/Previous navigation buttons.

### **B. Student Form (`form.html`)**
**Purpose:** A comprehensive data entry interface for creating or editing student records.
* **Form Architecture:** A 6-step wizard layout to prevent cognitive overload.
    * **Progress Indicator:** A visual step tracker at the top with circular badges and a connecting line that fills with blue as the user progresses.
* **Sections (Steps):**
    1.  **Personal Information:** Basic inputs, gender selection, DOB, blood group, and a profile photo file upload.
    2.  **Addresses:** Current and Permanent address blocks. Includes a "Same as Above" utility button to duplicate current address data.
    3.  **Academic Information:** Admission number, date, academic year, class, division, roll number, and fee status.
    4.  **Parent Information:** *Dynamic Array.* Allows users to add multiple parents/guardians using an "Add" (`+`) button or remove them via a delete icon.
    5.  **Course Information:** *Dynamic Array.* Capture enrolled courses, faculty, fees, and duration.
    6.  **Documents:** *Dynamic Array.* Track submitted documents (e.g., Birth Certificate) and their corresponding identification numbers. Includes a final checkbox for "Previously admitted to another school."
* **Interactions:** "Next" and "Previous" buttons control section visibility (`.hidden` toggling). The final step replaces "Next" with a "Submit" button. Form fields utilize custom `data-validation-type` attributes for script-side validation.

### **C. Student Profile View (`info.html`)**
**Purpose:** A read-only, highly formatted page displaying a single student's complete record.
* **Page Header:** Title and an "Export as PDF" utility button. 
* **Profile Banner (`.profile-header`):** A horizontal flex container featuring a large profile photo (min-height 60), full name, and quick-glance data (email, mobile, class, division, gender with dynamic SVG icons, and DOB).
* **Data Grid Layouts:** * Uses a 2-column grid structure (`grid-cols-[170px_1fr]`) to align standard data labels (slate colored) perfectly with their corresponding values (bolded).
* **Tables:** Courses and Documents are displayed in clean, read-only tables matching the style of the dashboard.
* **Print Styles (`@media print`):** * Hides the export button.
    * Removes container shadows and simplifies borders for clean paper printing.
    * Ensures sections do not break awkwardly across pages (`break-inside: avoid`).
    * Forces the parent flex grids into a single column (`grid-cols-1`) to accommodate narrower printed pages.

---

## **4. Interaction & Workflows**

1.  **Create Student:** User clicks "Add Student" on the Dashboard -> Navigates through the 6-step form -> Submits -> Redirects to Dashboard with the new record visible.
2.  **Update Student:** User clicks the Edit icon on a specific table row -> Opens `form.html?mode=edit` with inputs pre-populated -> Modifies data -> Submits.
3.  **Delete Student:** User clicks the Delete icon -> A semi-transparent dark overlay (`.modal`) appears with a confirmation dialog -> Clicking "Delete" executes the removal and updates the table.
4.  **View & Print:** User clicks the Info icon -> Navigates to the Profile View -> Can review data or click the PDF icon/print command to generate a hard copy.
