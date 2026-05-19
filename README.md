# AgriForecast

AgriForecast is a web-based Farm Resource Management System for managing farmer records, cooperatives, input distribution, assistance monitoring, food supply, staple food records, market prices, weather forecasts, advisories, reports, and users.

## Requirements

- XAMPP
- Apache
- MySQL / MariaDB
- PHP
- Python 3
- Browser, preferably Chrome or Microsoft Edge

## Project Folder

Place the project folder here:

```text
C:\xampp\htdocs\AGRIFORECAST
```

Then open the system using:

```text
http://localhost/AGRIFORECAST/index.html
```

## Database Setup

1. Open XAMPP Control Panel.
2. Start **Apache** and **MySQL**.
3. Open phpMyAdmin:

```text
http://localhost/phpmyadmin
```

4. Create a database named:

```text
agriforecast
```

5. Import the SQL file:

```text
agriforecast.sql
```

6. Make sure the database credentials in `config.php` match your XAMPP setup:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'agriforecast');
define('DB_USER', 'root');
define('DB_PASS', '');
```

## Running the System

1. Start **Apache** and **MySQL** in XAMPP.
2. Open the browser.
3. Go to:

```text
http://localhost/AGRIFORECAST/index.html
```

4. Login using an account from the imported sample database.

## Python Recommendation Microservice

The Advisories module uses a Python microservice.

To run it:

1. Open Command Prompt or terminal.
2. Go to the microservice folder:

```text
cd C:\xampp\htdocs\AGRIFORECAST\microservice
```

3. Install required packages if needed:

```text
pip install fastapi uvicorn
```

4. Run the service:

```text
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

5. Keep the terminal open while using the Advisories module.

The PHP bridge calls:

```text
http://localhost:8000/recommend
```

## Price Monitoring API Sync

The Price Monitoring module supports manual price entry and API-style price synchronization.

The sync endpoint is:

```text
api/price_sync.php
```

By default, it uses the DA PDF-derived JSON feed:

```text
api/da_price_feed_may_11_16_2026.json
```

This feed was extracted from the Department of Agriculture Bantay Presyo Monitoring PDF for May 11-16, 2026.

To use another JSON feed, edit `config.php`:

```php
define('PRICE_FEED_URL', '');
```

Set it to a valid JSON endpoint that returns price data in this format:

```json
{
  "source": "External price source",
  "prices": [
    {
      "commodity": "Rice",
      "price": 43.00,
      "unit": "kg",
      "market_area": "Daet Market",
      "record_date": "2026-05-18"
    }
  ]
}
```

When syncing, records with the same commodity, unit, and market area are updated instead of duplicated.

## Main Modules

- Dashboard
- Farmers & Cooperatives
- Input Distribution
- Assistance Monitoring
- Food Supply
- Staple Food
- Price Monitoring
- Weather Forecast
- Advisories
- Reports
- User Management

## Important Files

```text
index.html                  Main page
style.css                   System styles
app.js                      Frontend application logic
config.php                  Database and system configuration
agriforecast.sql            Exported database
api/                        PHP backend endpoints
microservice/main.py        Python recommendation service
AGRIFORECAST_DOCUMENTATION.md Documentation draft
```

## Troubleshooting

### Changes do not appear in the browser

Press:

```text
Ctrl + F5
```

This forces the browser to reload the updated CSS and JavaScript files.

### Database connection error

Check:

- MySQL is running in XAMPP.
- Database name is `agriforecast`.
- `config.php` database username and password are correct.
- `agriforecast.sql` was imported successfully.

### Advisories do not work

Check:

- Python microservice is running.
- The service is available at:

```text
http://localhost:8000/recommend
```

### Price sync does not work

Check:

- You are logged in as Admin or Officer.
- `api/price_sync.php` exists.
- `api/da_price_feed_may_11_16_2026.json` exists.
- Apache and MySQL are running.


Test Account:

(Admin)
Username: Admin
Password: Admin123

(Officer)
Username: christine
Password: 12345

(Cooperative)
Username: Bicol Farm Cooperative
Password: janel123

(Farmer)
Username: ck
Password: ck123
