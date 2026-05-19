# AgriForecast: Farm Resource Management System

## Project Title Page

**Project Title:** AgriForecast: Farm Resource Management System  
**System Type:** Web-Based Agricultural Resource Monitoring and Forecasting System  
**Prepared For:** Capstone / System Presentation  
**Prepared By:** [Your Name / Group Name]  
**Institution:** [School Name]  
**Date:** [Submission Date]  

---

## Introduction / Background

Agricultural offices and local farming organizations manage many types of information, including farmer profiles, cooperative records, input distributions, assistance programs, food supply levels, commodity prices, weather forecasts, and crop advisories. In many cases, these records are handled manually or through separate files, which can make monitoring slow, repetitive, and prone to errors.

AgriForecast was developed as a web-based Farm Resource Management System that centralizes agricultural records in one platform. The system helps authorized users manage farmer and cooperative data, track agricultural input releases, monitor assistance records, maintain food supply information, observe market price trends, view weather forecasts, and generate advisory recommendations.

The system also supports data-driven decision-making by combining manual records with external data sources, such as weather data, DA price monitoring data, and recommendation logic through a Python microservice.

---

## Objectives

### General Objective

To develop a web-based Farm Resource Management System that helps agricultural offices monitor resources, farmer records, market prices, weather conditions, and advisories in a centralized platform.

### Specific Objectives

- To provide a secure login system with role-based access.
- To manage records of farmers and cooperatives.
- To track agricultural input inventory and distribution records.
- To monitor agricultural assistance given to farmers and cooperatives.
- To maintain food supply and staple food records.
- To monitor market prices of agricultural commodities.
- To allow manual price entry and API-based price synchronization.
- To display weather forecast information for agricultural planning.
- To generate crop advisories based on weather conditions.
- To provide reports that summarize important agricultural data.

---

## Scope and Limitations

### Scope

AgriForecast includes the following modules:

- User login and session management
- Dashboard summary
- Farmers and cooperatives management
- Input inventory and distribution tracking
- Assistance monitoring
- Food supply monitoring
- Staple food management
- Price monitoring
- Weather forecast
- Crop advisories
- Reports and export features
- User management for administrators

The system is designed for users such as administrators, agricultural officers, cooperative users, and farmers.

### Limitations

- The system requires an internet connection for external weather data and API-based price synchronization.
- DA price monitoring data is based on available published files and may not represent real-time local market prices.
- Price sync currently uses converted DA PDF data unless a live external feed is configured.
- The advisory module depends on available weather data and the Python recommendation service.
- The system does not automatically verify all manually entered records.
- Some data accuracy still depends on proper encoding by authorized users.

---

## System Design

### System Architecture

AgriForecast follows a web-based client-server architecture.

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** PHP API endpoints
- **Database:** MySQL
- **External Services:** Weather API, DA price feed, Python recommendation microservice
- **Local Server:** XAMPP / Apache

### Simplified System Flow

```text
User
  ↓
Login Page
  ↓
Role-Based Dashboard
  ↓
System Modules
  ├── Farmers & Cooperatives
  ├── Input Distribution
  ├── Assistance Monitoring
  ├── Food Supply
  ├── Staple Food
  ├── Price Monitoring
  ├── Weather Forecast
  ├── Advisories
  ├── Reports
  └── User Management
```

### Data Flow Overview

```text
User Action
  ↓
JavaScript frontend request
  ↓
PHP API endpoint
  ↓
MySQL database / external service
  ↓
JSON response
  ↓
Updated user interface
```

### Suggested ERD Entities

The database may include the following main entities:

- Users
- Farmers
- Cooperatives
- Farmer-Cooperative relationship
- Farm Inputs
- Distributions
- Assistance Records
- Food Supply
- Staple Food
- Price Records
- Weather Data
- Farming Recommendations

---

## System Features Explanation

### 1. Login and Role-Based Access

The system provides login authentication for users. Access depends on the user role. Administrators and officers can manage most records, while cooperative and farmer users may have limited access depending on permissions.

### 2. Dashboard

The dashboard displays summary information such as total farmers, cooperatives, distributions, assistance cases, and weather information.

### 3. Farmers & Cooperatives

This module stores farmer profiles and cooperative information. Users can register, edit, search, and delete records depending on their permissions.

### 4. Input Distribution

This module tracks agricultural inputs such as seeds, fertilizers, pesticides, equipment, and other supplies. It also records distributions made to farmers.

### 5. Assistance Monitoring

This module records agricultural assistance provided to beneficiaries. It includes beneficiary details, support type, program, value, date, and status.

### 6. Food Supply

This module monitors commodity stock levels, capacity, unit, location, status, and date. It helps identify whether supply levels are adequate, moderate, low, or critical.

### 7. Staple Food

This module manages staple food items used in food supply records, such as rice, corn, mango, and other commodities.

### 8. Price Monitoring

This module monitors market prices of agricultural commodities. Users can manually add, edit, delete, and search price records. The system also supports API-based price synchronization using DA price data converted into a sync-ready feed.

### 9. Weather Forecast

This module displays current weather and forecast information. Weather data supports agricultural planning and decision-making.

### 10. Advisories

The advisory module generates crop recommendations based on weather conditions. For example, if rain is expected, the system may advise delaying fertilizer application and clearing drainage canals.

### 11. Reports

The reports module provides summaries and visualizations of system data. Reports can support planning, monitoring, and presentation of agricultural records.

### 12. User Management

Administrators can manage system users, including account details, roles, and status.

---

# User Manual

## 1. Getting Started

### 1.1 Opening the System

1. Open a browser.
2. Go to the local system URL:

```text
http://localhost/AGRIFORECAST/
```

3. Wait for the login page to load.

### 1.2 Logging In

1. Enter your username.
2. Enter your password.
3. Click **Sign In to System**.
4. After successful login, the system will open the dashboard.

If login fails, check if the username and password are correct.

---

## 2. Dashboard

The dashboard shows a quick summary of important system data.

### Steps

1. Login to the system.
2. The dashboard will automatically appear.
3. Review the summary cards, such as:
   - Total Farmers
   - Cooperatives
   - Distributions
   - Assistance Cases
   - Weather Today

---

## 3. Farmers & Cooperatives Module

This module is used to manage farmer and cooperative records.

### 3.1 Registering a Farmer

1. Click **Farmers & Cooperatives** from the sidebar.
2. Click **Register Farmer**.
3. Fill in the farmer details:
   - Full Name
   - Contact Number
   - Farm Location
   - Farm Size
   - Farm Type
   - Cooperative
   - Status
4. Click **Register Farmer**.
5. The farmer will appear in the farmers table.

### 3.2 Searching for a Farmer

1. Go to **Farmers & Cooperatives**.
2. Use the **Search farmers** bar.
3. Type the farmer name, location, cooperative, or contact detail.
4. The table will update based on the search.

### 3.3 Editing a Farmer

1. Find the farmer in the table.
2. Click **Edit**.
3. Update the necessary details.
4. Click **Save Changes**.

### 3.4 Deleting a Farmer

1. Find the farmer in the table.
2. Click **Delete**.
3. Confirm the deletion in the confirmation modal.

### 3.5 Adding a Cooperative

1. Go to the Cooperatives section.
2. Click **Add Cooperative**.
3. Fill in the cooperative name, location, members, and contact number.
4. Click **Save Cooperative**.

---

## 4. Input Distribution Module

This module manages input inventory and records releases to farmers.

### 4.1 Adding an Input Type

1. Click **Input Distribution** from the sidebar.
2. In the Input Inventory section, click **Add Input Type**.
3. Fill in the details:
   - Input Name
   - Description
   - Category
   - Unit
   - Stock
   - Supplier
4. Click **Save Input Type**.

### 4.2 Editing an Input Type

1. Find the input in the Input Inventory table.
2. Click **Edit**.
3. Update the details.
4. Click **Save Changes**.

### 4.3 Deleting an Input Type

1. Find the input in the table.
2. Click **Delete**.
3. Confirm the deletion.

Note: If the input type is already used in distribution records, it may not be deleted.

### 4.4 Recording a Distribution

1. Go to **Input Distribution**.
2. In the Distribution Records section, click **Record Distribution**.
3. Select the farmer and input type.
4. Enter the quantity, date, program, and remarks.
5. Click **Save Record**.

---

## 5. Assistance Monitoring Module

This module tracks support and assistance given to farmers or cooperatives.

### 5.1 Adding an Assistance Record

1. Click **Assistance Monitoring** from the sidebar.
2. Click **Add Record**.
3. Fill in the assistance details:
   - Farmer
   - Cooperative
   - Program
   - Support Type
   - Value
   - Date
   - Status
   - Description
4. Click **Save Record**.

### 5.2 Searching Assistance Records

1. Go to **Assistance Monitoring**.
2. Use the search bar.
3. Search by beneficiary, program, support type, status, or date.

### 5.3 Editing Assistance Records

1. Find the record.
2. Click **Edit**.
3. Update the information.
4. Click **Save Changes**.

### 5.4 Deleting Assistance Records

1. Find the record.
2. Click **Delete**.
3. Confirm deletion in the modal.

---

## 6. Food Supply Module

This module monitors stock and supply levels of commodities.

### 6.1 Adding a Supply Record

1. Click **Food Supply** from the sidebar.
2. Click **Add Supply**.
3. Fill in:
   - Food Item
   - Quantity
   - Capacity
   - Unit
   - Location
   - Remarks
4. Click **Save**.

### 6.2 Supply Status

The system displays supply status based on stock level. Examples include:

- Adequate
- Moderate
- Low
- Critical

### 6.3 Editing or Deleting Supply

1. Use **Edit** to update a supply record.
2. Use **Delete** to remove a supply record.
3. Confirm deletion when prompted.

---

## 7. Staple Food Module

This module manages food items used in supply records.

### 7.1 Adding Staple Food

1. Click **Staple Food**.
2. Click **Add Food**.
3. Enter the food name, category, and unit.
4. Click **Save**.

### 7.2 Editing Staple Food

1. Find the food item.
2. Click **Edit**.
3. Update the details.
4. Click **Save Changes**.

### 7.3 Deleting Staple Food

1. Find the food item.
2. Click **Delete**.
3. Confirm deletion.

---

## 8. Price Monitoring Module

This module monitors market prices of agricultural commodities.

### 8.1 Adding Price Records Manually

1. Click **Price Monitoring**.
2. Click **Add Price**.
3. Fill in:
   - Commodity
   - Current Price
   - Previous Price
   - Unit
   - Market Area
   - Date
4. Click **Save**.

### 8.2 Searching Price Records

1. Go to **Price Monitoring**.
2. Use the search bar.
3. Search by commodity, market area, unit, or date.

### 8.3 Syncing API Prices

1. Go to **Price Monitoring**.
2. Click **Sync API Prices**.
3. Wait for the sync confirmation message.
4. The table will update with imported price records.

The current sync setup uses DA Bantay Presyo data converted from a DA weekly price PDF. Matching records with the same commodity, unit, and market area are updated instead of duplicated.

### 8.4 Editing Price Records

1. Find the price record.
2. Click **Edit**.
3. Update the details.
4. Click **Save Changes**.

### 8.5 Deleting Price Records

1. Find the price record.
2. Click **Delete**.
3. Confirm deletion in the modal.

---

## 9. Weather Forecast Module

This module displays weather data used for agricultural planning.

### Steps

1. Click **Weather Forecast**.
2. Select a location if available.
3. View current temperature, condition, and forecast.

---

## 10. Advisories Module

This module displays weather-based crop advisories.

### Steps

1. Click **Advisories**.
2. Review the generated advisory.
3. Use the recommendation for planning farm activities.

Example advisory:

```text
Rain expected soon. Delay fertilizer application and clear drainage canals.
```

---

## 11. Reports Module

This module summarizes system records for decision-making.

### Steps

1. Click **Reports**.
2. Select filters if available.
3. Review charts and summary tables.
4. Export the report if needed.

---

## 12. User Management Module

This module is available to administrators.

### 12.1 Adding a User

1. Click **User Management**.
2. Click **Add User**.
3. Fill in:
   - Full Name
   - Username
   - Password
   - Email
   - Role
   - Status
4. Click **Create User**.

### 12.2 Editing a User

1. Find the user.
2. Click **Edit**.
3. Update user details.
4. Click **Save Changes**.

### 12.3 Deleting a User

1. Find the user.
2. Click **Delete**.
3. Confirm deletion.

---

## Troubleshooting

### The page does not show new changes

Press:

```text
Ctrl + F5
```

This forces the browser to reload updated CSS and JavaScript files.

### Price sync does not work

Check the following:

- Make sure you are logged in as Admin or Officer.
- Make sure the local server is running.
- Check if `api/price_sync.php` exists.
- Check if the price feed JSON file exists.

### Weather or advisories do not update

Check the following:

- Internet connection
- Weather API endpoint
- Python recommendation microservice

### Delete does not work

Some records cannot be deleted if they are already used by other records. For example, an input type used in distribution records may be blocked from deletion.

---

## Conclusion

AgriForecast provides a centralized platform for managing agricultural resources and decision-support information. It helps users monitor farmers, cooperatives, input distributions, assistance programs, food supply, staple food records, prices, weather forecasts, and advisories. Through manual encoding and API-based data synchronization, the system supports better planning and more informed agricultural decision-making.

