# Admin Statistics Module - User Guide

## Overview

The Statistics module allows administrators to manually manage all data displayed on the public `/statistics` page. This is a manual-only v1 implementation (no automation, no e-Stat API integration).

## Accessing the Statistics Admin Page

1. Log in to the Admin Dashboard at `/admin/login`
2. Navigate to **Statistics** in the left sidebar menu
3. The Statistics Management page will load with all editable sections

## Sections Overview

The admin page is divided into 6 main sections:

### 1. Snapshot Metadata

- **Year**: The year this data represents (e.g., 2024)
- **Badge Text**: The badge displayed on the public statistics page (e.g., "DEMOGRAPHIC DATA 2024")
- Click **Save Metadata** to persist changes

### 2. KPIs (Key Performance Indicators)

Manage 3 main statistics:

- **total_foreigners**: Total number of foreigners in Japan
- **nationalities**: Number of different nationalities
- **avg_salary_national**: Average national salary

For each KPI, you can set:

- **Value**: The numeric value
- **Delta Text**: Change indicator (e.g., "+5.2% vs 2023")
- **Prefix**: Display prefix (e.g., "¥" for salary)

Click **Save KPIs** to persist changes.

### 3. Top 10 Nationalities

Manage the ranked list of top 10 nationalities:

- **Rank**: Auto-numbered 1-10
- **Nationality**: Name of the nationality (e.g., "Vietnam")
- **Code (optional)**: ISO code (e.g., "VN")
- **Value**: Number of people from that nationality

Click **Save Top Nationalities** to persist changes.

### 4. Prefecture Density

Manage density/index values for all 47 Japanese prefectures:

**First Time Setup:**

1. Click **Seed All 47 Prefectures** button
2. This will create entries for all prefectures with 0 values
3. Edit the **Density Value** for each prefecture as needed
4. Click **Save Prefecture Density** to persist changes

**Editing:**

- Scroll through the list of prefectures
- Update the **Density Value** field for each prefecture
- Values can be decimals (e.g., 42.5)

### 5. Salary Comparison

Manage salary comparison data:

- **Official Status**: Choose "Coming Soon" or "Ready"
- **Official Note**: Note about official data (e.g., "Awaiting update...")
- **Community Value (¥)**: Community-reported average salary in yen
- **Community Note**: Note about community data (e.g., "Reported by 12,000+ users in 2024")

Click **Save Salary Comparison** to persist changes.

## Important Notes

### Data Persistence

- All changes must be saved using the respective **Save** button for each section
- Changes are not saved automatically
- A success/error message will appear after each save operation

### Validation

- Numeric fields require valid numbers
- Empty nationality labels in Top 10 will be saved but may cause display issues
- Prefecture codes and names are read-only after seeding

### Refresh Data

- Click the **Refresh** button in the top-right corner to reload all data from the database
- This will discard any unsaved changes

### Public Display

- Only the **active snapshot** (is_active = true) is displayed on the public `/statistics` page
- Currently, only one snapshot is supported ("default")
- Future versions may support multiple snapshots per year

## Workflow Example

1. **Initial Setup:**
   - Navigate to Admin > Statistics
   - Update Snapshot Metadata (year, badge text)
   - Save Metadata
   - Seed prefectures if not already done
   - Fill in KPI values and deltas
   - Save KPIs

2. **Regular Updates:**
   - Update KPI values as new data becomes available
   - Update Top 10 nationalities ranking
   - Update prefecture density values
   - Update salary comparison data
   - Save each section after editing

3. **Verification:**
   - Visit the public `/statistics` page to verify changes
   - Ensure all data displays correctly

## Troubleshooting

### Data Not Showing on Public Page

- Ensure you clicked the **Save** button for the section
- Check that the snapshot is marked as active (is_active = true)
- Refresh the public page (Ctrl+F5 or Cmd+Shift+R)

### Prefecture List is Empty

- Click the **Seed All 47 Prefectures** button
- This will create all prefecture entries with 0 values
- You can then edit the values

### Changes Not Persisting

- Ensure you're clicking the correct **Save** button for each section
- Check browser console for any errors
- Verify you have admin permissions

## Security

- Only users with admin role can access this page
- All database operations are protected by Row Level Security (RLS)
- Non-admin users can only read active snapshot data on the public page

## Future Enhancements (Phase 2+)

- e-Stat API integration for automatic data fetching
- Multi-year snapshot management
- Data import/export functionality
- Automated data validation
- Change history tracking
