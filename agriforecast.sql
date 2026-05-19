-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 18, 2026 at 07:01 PM
-- Server version: 12.2.2-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `agriforecast`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_data`)),
  `new_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_data`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `user_id`, `action`, `table_name`, `record_id`, `old_data`, `new_data`, `ip_address`, `created_at`) VALUES
(1, 7, 'LOGIN', 'users', 7, NULL, NULL, '127.0.0.1', '2026-05-01 15:46:02');

-- --------------------------------------------------------

--
-- Table structure for table `api_logs`
--

CREATE TABLE `api_logs` (
  `log_id` int(11) NOT NULL,
  `api_name` varchar(50) DEFAULT NULL,
  `endpoint` varchar(255) DEFAULT NULL,
  `request_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`request_data`)),
  `response_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_data`)),
  `status_code` int(11) DEFAULT NULL,
  `response_time_ms` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_logs`
--

INSERT INTO `api_logs` (`log_id`, `api_name`, `endpoint`, `request_data`, `response_data`, `status_code`, `response_time_ms`, `created_at`) VALUES
(1, 'WeatherAPI', 'https://api.openweathermap.org/data/2.5/weather', '{\"q\":\"Naga City\"}', '{\"temp\":28,\"condition\":\"clouds\"}', 200, 245, '2026-05-01 15:45:48');

-- --------------------------------------------------------

--
-- Table structure for table `assistance_records`
--

CREATE TABLE `assistance_records` (
  `assistance_id` int(11) NOT NULL,
  `farmer_id` int(11) DEFAULT NULL,
  `cooperative_id` int(11) DEFAULT NULL,
  `program_name` varchar(100) DEFAULT NULL,
  `support_type` varchar(100) NOT NULL,
  `value_amount` decimal(12,2) DEFAULT NULL,
  `given_by` varchar(100) DEFAULT NULL,
  `given_by_user_id` int(11) DEFAULT NULL,
  `date_given` date NOT NULL,
  `status` enum('Processing','Released','Cancelled') DEFAULT 'Processing',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `assistance_records`
--

INSERT INTO `assistance_records` (`assistance_id`, `farmer_id`, `cooperative_id`, `program_name`, `support_type`, `value_amount`, `given_by`, `given_by_user_id`, `date_given`, `status`, `description`, `created_at`, `updated_at`) VALUES
(1, 5, NULL, 'RCEF', 'Seed Subsidy', 3200.00, 'Maria Santos', 7, '2025-01-08', 'Released', 'Rice seed subsidy for wet season', '2026-05-01 15:44:10', '2026-05-01 15:44:10'),
(26, 5, NULL, 'RCEF', 'Seed', 1200.00, 'System Administrator', NULL, '2026-05-07', 'Released', 'bbb', '2026-05-07 13:35:49', '2026-05-07 16:23:58'),
(27, NULL, 2, 'RCEF', 'Seed', 1200.00, 'System Administrator', NULL, '2026-05-07', 'Released', 'yyy', '2026-05-07 13:35:49', '2026-05-07 16:40:01'),
(28, 17, NULL, 'RCEF', 'xx', 23.00, 'System Administrator', 7, '2026-05-07', 'Released', 'xxx', '2026-05-07 13:41:44', '2026-05-07 17:17:02'),
(32, 17, NULL, 'koo', 'seed', 222.00, 'System Administrator', 7, '2026-05-16', 'Released', 'ccc', '2026-05-07 16:10:23', '2026-05-18 13:34:37');

-- --------------------------------------------------------

--
-- Table structure for table `cooperatives`
--

CREATE TABLE `cooperatives` (
  `cooperative_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `members_count` int(11) DEFAULT 0,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cooperatives`
--

INSERT INTO `cooperatives` (`cooperative_id`, `name`, `location`, `contact_person`, `contact_number`, `members_count`, `registered_at`, `updated_at`) VALUES
(1, 'Magsasaka Coop', 'San Isidro', 'Juan Cruz', '054-1234567', 1, '2026-05-01 15:42:23', '2026-05-05 16:27:50'),
(2, 'Daet Rice Cooperative', 'Daet, Camarines Norte', NULL, '09999999991', 1, '2026-05-03 06:41:37', '2026-05-18 15:24:38');

-- --------------------------------------------------------

--
-- Table structure for table `distributions`
--

CREATE TABLE `distributions` (
  `distribution_id` int(11) NOT NULL,
  `input_id` int(11) NOT NULL,
  `farmer_id` int(11) DEFAULT NULL,
  `cooperative_id` int(11) DEFAULT NULL,
  `distributed_by` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `program` varchar(50) DEFAULT NULL,
  `distribution_date` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `distributions`
--

INSERT INTO `distributions` (`distribution_id`, `input_id`, `farmer_id`, `cooperative_id`, `distributed_by`, `quantity`, `program`, `distribution_date`, `remarks`, `created_at`) VALUES
(1, 1, 5, NULL, 7, 9.00, 'RCEF', '2025-01-10', 'mmmm', '2026-05-01 15:43:56'),
(2, 2, 17, NULL, 7, 9.00, 'RCEF', '2026-05-06', '', '2026-05-06 14:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `farmers`
--

CREATE TABLE `farmers` (
  `farmer_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `farm_location` varchar(255) DEFAULT NULL,
  `farm_size_ha` decimal(10,2) DEFAULT NULL,
  `farm_type` enum('Crop','Livestock','Fishery','Mixed') DEFAULT 'Crop',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `farmers`
--

INSERT INTO `farmers` (`farmer_id`, `user_id`, `full_name`, `contact_number`, `farm_location`, `farm_size_ha`, `farm_type`, `status`, `registered_at`, `updated_at`) VALUES
(5, 7, 'Pedro Reyes', '09171234567', 'Brgy. San Isidro', 2.50, 'Crop', 'Active', '2026-05-01 15:42:04', '2026-05-01 15:42:04'),
(17, NULL, 'Crystelle Villanueva', '09656016837', 'Barangay II, Daet, Cam. Norte', 3.60, 'Mixed', 'Active', '2026-05-05 14:36:58', '2026-05-18 15:25:09'),
(19, NULL, 'wee', '99991', 'Barangay II, Daet, Cam. Norte', 222.00, 'Mixed', 'Active', '2026-05-05 14:48:23', '2026-05-07 16:24:33'),
(20, NULL, 'Crystelle Villanueva', '09656016837', 'Barangay II, Daet, Cam. Norte', 3.60, 'Crop', 'Active', '2026-05-05 15:04:20', '2026-05-05 15:04:20'),
(21, NULL, 'dda', 'd99e', 'cd', 11.00, 'Crop', 'Active', '2026-05-05 15:28:10', '2026-05-05 15:28:10');

-- --------------------------------------------------------

--
-- Table structure for table `farmer_cooperative`
--

CREATE TABLE `farmer_cooperative` (
  `farmer_id` int(11) NOT NULL,
  `cooperative_id` int(11) NOT NULL,
  `joined_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `farmer_cooperative`
--

INSERT INTO `farmer_cooperative` (`farmer_id`, `cooperative_id`, `joined_date`) VALUES
(5, 1, '2025-01-15'),
(21, 2, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `farming_recommendations`
--

CREATE TABLE `farming_recommendations` (
  `recommendation_id` int(11) NOT NULL,
  `weather_id` int(11) DEFAULT NULL,
  `advisory_type` enum('warning','info','success','danger') DEFAULT 'info',
  `title` varchar(255) NOT NULL,
  `advisory_text` text NOT NULL,
  `action_required` varchar(255) DEFAULT NULL,
  `target_crop` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `farming_recommendations`
--

INSERT INTO `farming_recommendations` (`recommendation_id`, `weather_id`, `advisory_type`, `title`, `advisory_text`, `action_required`, `target_crop`, `created_at`, `expires_at`) VALUES
(1, 1, 'info', 'Favorable Conditions for Rice Transplanting', 'Current soil moisture and temperatures are ideal for transplanting wet-season rice varieties.', 'Recommended window: Tuesday to Friday this week', 'Rice', '2026-05-01 15:45:33', '2026-05-08');

-- --------------------------------------------------------

--
-- Table structure for table `farm_inputs`
--

CREATE TABLE `farm_inputs` (
  `input_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` enum('Fertilizer','Seeds','Pesticide','Equipment','Other') DEFAULT 'Other',
  `unit` varchar(20) NOT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `supplier` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('Available','Out-of-Stock') DEFAULT 'Available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `farm_inputs`
--

INSERT INTO `farm_inputs` (`input_id`, `name`, `category`, `unit`, `stock_quantity`, `supplier`, `description`, `created_at`, `updated_at`, `status`) VALUES
(1, 'NPK 15-15-15', 'Fertilizer', 'bags', 7, 'AgriCorp', 'Complete fertilizer for rice and corn', '2026-05-01 15:43:42', '2026-05-06 14:38:17', 'Available'),
(2, 'Corn Seeds', 'Seeds', 'bags', 51, 'DA Provincial Office', 'witiwiw', '2026-05-06 05:54:20', '2026-05-18 15:33:27', 'Available'),
(3, 'vffv', 'Seeds', 'vv', 6, 'nnn', 'dsda', '2026-05-06 08:33:36', '2026-05-06 08:33:36', 'Available');

-- --------------------------------------------------------

--
-- Table structure for table `price_records`
--

CREATE TABLE `price_records` (
  `price_id` int(11) NOT NULL,
  `commodity` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `prev_price` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) DEFAULT '/kg',
  `market_area` varchar(255) DEFAULT NULL,
  `record_date` date NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `price_records`
--

INSERT INTO `price_records` (`price_id`, `commodity`, `price`, `prev_price`, `unit`, `market_area`, `record_date`, `updated_by`, `created_at`) VALUES
(3, 'Corn', 67.00, 67.00, 'kg', 'Daet Market', '2026-05-18', 7, '2026-05-18 13:34:03'),
(5, 'Rice (Regular)', 43.00, 43.00, '/kg', 'Daet Market', '2026-05-18', 7, '2026-05-18 16:04:48'),
(7, 'Mango', 65.00, 65.00, 'kg', 'Daet Market', '2026-05-18', 7, '2026-05-18 16:04:48'),
(9, 'Kadiwa Rice-For-All - P20 Benteng Bigas Meron Naᵃ', 20.00, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(10, 'Imported Commercial Rice - Basmati', 214.41, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(11, 'Imported Commercial Rice - Glutinous', 61.33, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(12, 'Imported Commercial Rice - Japonica/Jasponica', 63.82, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(13, 'Imported Commercial Rice - Other Special Rice White Rice', 59.64, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(14, 'Imported Commercial Rice - Premium 5% broken', 57.60, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(15, 'Imported Commercial Rice - Well Milled 1-19% bran streak', 48.06, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(16, 'Imported Commercial Rice - Regular Milled 20-40% bran streak', 42.50, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(17, 'Local Commercial Rice - Glutinous', 76.32, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(18, 'Local Commercial Rice - Other Special Rice White Rice', 60.38, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(19, 'Local Commercial Rice - Premium 5% broken', 55.60, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(20, 'Local Commercial Rice - Well Milled 1-19% bran streak', 50.27, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(21, 'Local Commercial Rice - Regular Milled 20-40% bran streak', 45.20, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(22, 'Corn Products - Corn (White) Cob, Glutinous', 80.56, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(23, 'Corn Products - Corn (Yellow) Cob, Sweet Corn', 71.80, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(24, 'Corn Products - Corn Grits (White, Food Grade)', 111.25, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(25, 'Corn Products - Corn Grits (Yellow, Food Grade)', 111.25, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(26, 'Corn Products - Corn Cracked (Yellow, Feed Grade)', 49.11, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(27, 'Corn Products - Corn Grits (Feed Grade)', 46.76, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(28, 'Legumes - Mungbean', 157.53, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(29, 'Fish Products - Alumahan (Indian Mackerel) Medium (4-6 pcs/kg)', 307.89, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(30, 'Fish Products - Bangus, Large Large (1-2 pcs)', 251.50, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(31, 'Fish Products - Bangus, Medium Medium (3-4 pcs/kg)', 230.60, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(32, 'Fish Products - Galunggong, Local Male, Medium (12-14 pcs/kg)', 240.27, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(33, 'Fish Products - Sardines (Tamban)', 156.56, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(34, 'Fish Products - Squid (Pusit Bisaya), Local Medium', 447.80, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(35, 'Fish Products - Tambakol (Yellow-Fin Tuna), Local Medium, Fresh or Chilled', 299.25, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(36, 'Fish Products - Tilapia Medium (5-6 pcs/kg)', 154.29, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(37, 'Beef Products - Beef Brisket, Local Meat with Bones', 444.14, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(38, 'Beef Products - Beef Rump, Local Lean Meat/ Tapadera', 494.72, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(39, 'Beef Products - Pork Belly (Liempo), Local', 403.67, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(40, 'Beef Products - Pork Belly (Liempo), Imported', 313.51, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(41, 'Beef Products - Pork Picnic Shoulder (Kasim), Local', 348.26, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(42, 'Beef Products - Pork Picnic Shoulder (Kasim), Imported', 254.17, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(43, 'Beef Products - Whole Chicken, Local Fully Dressed', 193.87, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(44, 'Beef Products - Chicken Egg (White, Pewee) 41-45 grams/pc', 6.12, NULL, 'pc', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(45, 'Beef Products - Chicken Egg (White, Extra Small) 46-50 grams/pc', 6.72, NULL, 'pc', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(46, 'Beef Products - Chicken Egg (White, Small) 51-55 grams/pc', 7.37, NULL, 'pc', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(47, 'Beef Products - Chicken Egg (White, Medium) 56-60 grams/pc', 8.03, NULL, 'pc', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(48, 'Beef Products - Chicken Egg (White, Large) 61-65 grams/pc', 8.62, NULL, 'pc', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(49, 'Beef Products - Chicken Egg (White, Extra Large) 66-70 grams/pc', 9.18, NULL, 'pc', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(50, 'Beef Products - Chicken Egg (White, Jumbo) 71> grams/pc', 9.82, NULL, 'pc', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(51, 'Beef Products - Chicken Egg (Brown, Medium) Medium', 10.73, NULL, 'pc', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(52, 'Beef Products - Chicken Egg (Brown, Large) Large', 12.13, NULL, 'pc', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(53, 'Beef Products - Chicken Egg (Brown, Extra Large) Extra Large', 11.88, NULL, 'pc', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(54, 'Lowland Vegetables - Ampalaya 4-5 pcs/kg', 118.32, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(55, 'Lowland Vegetables - Chilli (Green), Local Haba/Panigang', 120.54, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(56, 'Lowland Vegetables - Eggplant 3-4 Small Bundles', 84.59, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(57, 'Lowland Vegetables - Native Pechay 3-4 Small Bundles', 78.55, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(58, 'Lowland Vegetables - Pole Sitao 3-4 Small Bundles', 107.37, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(59, 'Lowland Vegetables - Squash Suprema Variety', 63.82, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(60, 'Lowland Vegetables - Tomato 15-18 pcs/kg', 62.24, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(61, 'Highland Vegetables - Bell Pepper (Green), Local Medium (151-250gm/pc)', 240.30, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(62, 'Highland Vegetables - Bell Pepper (Red), Local Medium (151-250gm/pc)', 243.85, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(63, 'Highland Vegetables - Broccoli, Local Medium (8-10 cm diameter/bunch hd)', 165.16, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(64, 'Highland Vegetables - Cauliflower, Local Medium (8-10 cm diameter/bunch hd)', 129.48, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(65, 'Highland Vegetables - Cabbage (Rare Ball) 510 gm - 1 kg/head', 58.85, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(66, 'Highland Vegetables - Cabbage (Scorpio) 750 gm - 1 kg/head', 65.33, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(67, 'Highland Vegetables - Cabbage (Wonder Ball) 510 gm - 1 kg/head', 58.82, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(68, 'Highland Vegetables - Carrots, Local 8-10 pcs/kg', 139.23, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(69, 'Highland Vegetables - Celery Medium (501-800 g)', 147.41, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(70, 'Highland Vegetables - Chayote Medium (301-400 g)', 64.62, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(71, 'Highland Vegetables - Habichuelas/Baguio Beans, Local', 123.60, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(72, 'Highland Vegetables - Pechay Baguio', 74.59, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(73, 'Highland Vegetables - Lettuce (Green Ice)', 264.52, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(74, 'Highland Vegetables - Lettuce (Iceberg) Medium (301-450 cm diameter/bunch hd)', 191.56, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(75, 'Highland Vegetables - Lettuce (Romaine)', 236.89, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(76, 'Highland Vegetables - White Potato, Local 10-12 pcs/kg', 97.04, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(77, 'Spices - Chilli (Red), Local Tingala', 139.73, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(78, 'Spices - Garlic, Native/Local', 400.00, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(79, 'Spices - Garlic, Imported', 146.79, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(80, 'Spices - Ginger, Local Fairly well-matured, Medium (150-300 gm)', 166.48, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(81, 'Spices - Red Onion, Local 13-15 pcs/kg', 94.99, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(82, 'Spices - Red Onion, Imported', 86.76, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(83, 'Spices - White Onion, Local', 90.33, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(84, 'Spices - White Onion, Imported', 90.32, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(85, 'Fruits - Avocado', 235.96, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(86, 'Fruits - Banana (Lakatan) 8-10 pcs/kg', 98.78, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(87, 'Fruits - Banana (Latundan) 10-12 pcs/kg', 75.37, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(88, 'Fruits - Banana (Saba)', 59.02, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(89, 'Fruits - Calamansi', 136.94, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(90, 'Fruits - Mango (Carabao) Ripe, 3-4 pcs/kg', 153.25, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(91, 'Fruits - Melon', 102.99, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(92, 'Fruits - Papaya Solo, Ripe, 2-3 pcs/kg', 73.72, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(93, 'Fruits - Pomelo', 176.70, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(94, 'Fruits - Watermelon', 75.52, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(95, 'Other Basic Commodities - Salt (Rock)', 21.15, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(96, 'Other Basic Commodities - Salt (Iodized)', 41.23, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(97, 'Other Basic Commodities - Sugar (Refined)', 82.15, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(98, 'Other Basic Commodities - Sugar (Washed)', 75.07, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(99, 'Other Basic Commodities - Sugar (Brown)', 73.06, NULL, 'kg', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(100, 'Other Basic Commodities - Cooking Oil (Palm) 350 ml/bottle', 39.55, NULL, 'ml', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(101, 'Other Basic Commodities - Cooking Oil (Palm) 1 Liter/bottle', 98.59, NULL, 'L', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(102, 'Other Basic Commodities - Cooking Oil (Coconut) 350 ml/bottle', 59.95, NULL, 'ml', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06'),
(103, 'Other Basic Commodities - Cooking Oil (Coconut) 1 Liter/bottle', 161.73, NULL, 'L', 'DA Bantay Presyo - NCR Weekly Average', '2026-05-16', 7, '2026-05-18 16:17:06');

-- --------------------------------------------------------

--
-- Table structure for table `staple_food`
--

CREATE TABLE `staple_food` (
  `food_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `unit` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staple_food`
--

INSERT INTO `staple_food` (`food_id`, `name`, `category`, `unit`) VALUES
(1, 'Rice', 'Grains', 'bags (120kg)'),
(2, 'Mango', 'Fruits', 'sacks');

-- --------------------------------------------------------

--
-- Table structure for table `supply_records`
--

CREATE TABLE `supply_records` (
  `supply_id` int(11) NOT NULL,
  `food_id` int(11) NOT NULL,
  `quantity_available` decimal(12,2) NOT NULL,
  `capacity` decimal(12,2) DEFAULT NULL,
  `unit` varchar(20) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('Adequate','Moderate','Critical') DEFAULT 'Moderate',
  `record_date` date NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supply_records`
--

INSERT INTO `supply_records` (`supply_id`, `food_id`, `quantity_available`, `capacity`, `unit`, `location`, `status`, `record_date`, `updated_by`, `remarks`, `created_at`) VALUES
(1, 1, 4200.00, 6000.00, 'bags (50kg)', 'City Bodega', 'Moderate', '2025-01-22', 7, NULL, '2026-05-01 15:44:37'),
(4, 1, 120.00, 10000.00, 'sacks', 'Barangay II, Daet', 'Critical', '2026-05-07', 7, '', '2026-05-07 17:45:41'),
(5, 1, 4.00, 28.00, 'sacks', 'Barangay II, Daet', 'Critical', '2026-05-07', 7, '', '2026-05-07 17:47:09'),
(6, 2, 3.00, 2.00, 'sacks', 'Barangay II, Daet', 'Adequate', '2026-05-07', 7, '', '2026-05-07 18:03:32');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('ADMIN','OFFICER','COOPERATIVE','USER') DEFAULT 'USER',
  `cooperative_id` int(11) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `cooperative_id`, `status`, `created_at`, `updated_at`) VALUES
(7, 'admin', '$2y$10$nV6lQ.AQhICgKlLK48enpeer5HTGZX4bn6TaezCLBf64tlpxy.e8.', 'System Administrator', 'admin@agriforecast.gov', 'ADMIN', NULL, 'Active', '2026-05-01 15:39:18', '2026-05-02 03:45:19'),
(72, 'juan', '$2y$10$ZZ0RVXkcnhY48UUrkbzdwuza5zm8cWhX1JOOgKpH.lkt316kc2YDi', 'Juan Dela Cruz', 'juan@gmail.com', 'USER', NULL, 'Active', '2026-05-02 15:20:56', '2026-05-02 15:20:56'),
(75, 'Bicol Farm Cooperative', '$2y$10$avkx0lewSCpORGLhCJ.WGunw4Gb36eKF6QyzBBBxMNIJaLUO9HeaC', 'Janel Dela Cruz', 'bicolfarm@gmail.com', 'COOPERATIVE', 2, 'Active', '2026-05-02 15:31:42', '2026-05-18 13:39:08'),
(76, 'Daet Farm Cooperative', '$2y$10$.sy5y.kEKCeb/GQQ/keL6uJStnFNqjySFCfta8NPYtOJ/SIwacEq.', 'Daet Farm Cooperative', 'daetfarm@gmail.com', 'COOPERATIVE', NULL, 'Active', '2026-05-02 15:50:47', '2026-05-02 15:50:47'),
(79, 'lhorwin', '$2y$10$eF0wQKaqFPztBS.LFNDk9uAzWdEAEa3cBEsbgoCDYx4Kj4uGKH10u', 'Lhorwin Comploma', 'lhorwin@gmail.com', 'OFFICER', NULL, 'Active', '2026-05-03 07:25:03', '2026-05-03 07:25:03'),
(80, 'Telle', '$2y$10$8hO14wDZc2PccuVDmMdTVeHN1Hkqo/uKWLRaArkn4aItRY.X7luDG', 'Crystelle S.', 'chkr.hvn@gmail.com', 'COOPERATIVE', 2, 'Active', '2026-05-05 14:33:11', '2026-05-18 17:01:09'),
(81, 'Crystelle Villanueva', '$2y$10$cbEC3Z0hEJre3GH7sPooAuvNwb2Liqfei/XT08y2PX4ovIJp7f2oq', 'Crystelle Villanueva', 'crystelle@gmail.com', 'USER', NULL, 'Active', '2026-05-05 14:38:31', '2026-05-05 14:38:31'),
(83, 'ck', '$2y$10$hKuc34SGCJXfYUyE6dJ1MeHsxrz86umoC0Bx5MtSWfbdtQVv2vUlm', 'Ck J', 'ck@gmail.com', 'USER', NULL, 'Active', '2026-05-18 14:22:44', '2026-05-18 14:22:44'),
(84, 'christine', '$2y$10$U.GFvYhh1J4PbY80KYS0EeSkNS/liAczNk6YL7.Wz9KpDP0/S5fV6', 'Christine S', 'christine@gmail.com', 'OFFICER', NULL, 'Active', '2026-05-18 14:23:36', '2026-05-18 14:23:36');

-- --------------------------------------------------------

--
-- Table structure for table `weather_data`
--

CREATE TABLE `weather_data` (
  `weather_id` int(11) NOT NULL,
  `location` varchar(100) NOT NULL,
  `forecast_date` date NOT NULL,
  `temperature_c` decimal(5,2) DEFAULT NULL,
  `humidity` int(11) DEFAULT NULL,
  `rainfall_mm` decimal(8,2) DEFAULT 0.00,
  `wind_speed` decimal(6,2) DEFAULT NULL,
  `condition` varchar(50) DEFAULT NULL,
  `icon` varchar(10) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `fetched_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `weather_data`
--

INSERT INTO `weather_data` (`weather_id`, `location`, `forecast_date`, `temperature_c`, `humidity`, `rainfall_mm`, `wind_speed`, `condition`, `icon`, `description`, `fetched_at`) VALUES
(1, 'Naga City, Camarines Sur', '2025-01-23', 28.00, 78, 0.00, 14.00, 'Partly Cloudy', '⛅', 'Warm with clouds', '2026-05-01 15:45:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `api_logs`
--
ALTER TABLE `api_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `assistance_records`
--
ALTER TABLE `assistance_records`
  ADD PRIMARY KEY (`assistance_id`),
  ADD KEY `farmer_id` (`farmer_id`),
  ADD KEY `cooperative_id` (`cooperative_id`),
  ADD KEY `given_by_user_id` (`given_by_user_id`);

--
-- Indexes for table `cooperatives`
--
ALTER TABLE `cooperatives`
  ADD PRIMARY KEY (`cooperative_id`);

--
-- Indexes for table `distributions`
--
ALTER TABLE `distributions`
  ADD PRIMARY KEY (`distribution_id`),
  ADD KEY `input_id` (`input_id`),
  ADD KEY `farmer_id` (`farmer_id`),
  ADD KEY `cooperative_id` (`cooperative_id`),
  ADD KEY `distributed_by` (`distributed_by`);

--
-- Indexes for table `farmers`
--
ALTER TABLE `farmers`
  ADD PRIMARY KEY (`farmer_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `farmer_cooperative`
--
ALTER TABLE `farmer_cooperative`
  ADD PRIMARY KEY (`farmer_id`,`cooperative_id`),
  ADD KEY `cooperative_id` (`cooperative_id`);

--
-- Indexes for table `farming_recommendations`
--
ALTER TABLE `farming_recommendations`
  ADD PRIMARY KEY (`recommendation_id`),
  ADD KEY `weather_id` (`weather_id`);

--
-- Indexes for table `farm_inputs`
--
ALTER TABLE `farm_inputs`
  ADD PRIMARY KEY (`input_id`);

--
-- Indexes for table `price_records`
--
ALTER TABLE `price_records`
  ADD PRIMARY KEY (`price_id`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `staple_food`
--
ALTER TABLE `staple_food`
  ADD PRIMARY KEY (`food_id`);

--
-- Indexes for table `supply_records`
--
ALTER TABLE `supply_records`
  ADD PRIMARY KEY (`supply_id`),
  ADD KEY `food_id` (`food_id`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `weather_data`
--
ALTER TABLE `weather_data`
  ADD PRIMARY KEY (`weather_id`),
  ADD UNIQUE KEY `unique_weather_day` (`location`,`forecast_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `api_logs`
--
ALTER TABLE `api_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `assistance_records`
--
ALTER TABLE `assistance_records`
  MODIFY `assistance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `cooperatives`
--
ALTER TABLE `cooperatives`
  MODIFY `cooperative_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `distributions`
--
ALTER TABLE `distributions`
  MODIFY `distribution_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `farmers`
--
ALTER TABLE `farmers`
  MODIFY `farmer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `farming_recommendations`
--
ALTER TABLE `farming_recommendations`
  MODIFY `recommendation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `farm_inputs`
--
ALTER TABLE `farm_inputs`
  MODIFY `input_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `price_records`
--
ALTER TABLE `price_records`
  MODIFY `price_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `staple_food`
--
ALTER TABLE `staple_food`
  MODIFY `food_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `supply_records`
--
ALTER TABLE `supply_records`
  MODIFY `supply_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `weather_data`
--
ALTER TABLE `weather_data`
  MODIFY `weather_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `assistance_records`
--
ALTER TABLE `assistance_records`
  ADD CONSTRAINT `assistance_records_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`farmer_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assistance_records_ibfk_2` FOREIGN KEY (`cooperative_id`) REFERENCES `cooperatives` (`cooperative_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assistance_records_ibfk_3` FOREIGN KEY (`given_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `distributions`
--
ALTER TABLE `distributions`
  ADD CONSTRAINT `distributions_ibfk_1` FOREIGN KEY (`input_id`) REFERENCES `farm_inputs` (`input_id`),
  ADD CONSTRAINT `distributions_ibfk_2` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`farmer_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `distributions_ibfk_3` FOREIGN KEY (`cooperative_id`) REFERENCES `cooperatives` (`cooperative_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `distributions_ibfk_4` FOREIGN KEY (`distributed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `farmers`
--
ALTER TABLE `farmers`
  ADD CONSTRAINT `farmers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `farmer_cooperative`
--
ALTER TABLE `farmer_cooperative`
  ADD CONSTRAINT `farmer_cooperative_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `farmers` (`farmer_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `farmer_cooperative_ibfk_2` FOREIGN KEY (`cooperative_id`) REFERENCES `cooperatives` (`cooperative_id`) ON DELETE CASCADE;

--
-- Constraints for table `farming_recommendations`
--
ALTER TABLE `farming_recommendations`
  ADD CONSTRAINT `farming_recommendations_ibfk_1` FOREIGN KEY (`weather_id`) REFERENCES `weather_data` (`weather_id`) ON DELETE SET NULL;

--
-- Constraints for table `price_records`
--
ALTER TABLE `price_records`
  ADD CONSTRAINT `price_records_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `supply_records`
--
ALTER TABLE `supply_records`
  ADD CONSTRAINT `supply_records_ibfk_1` FOREIGN KEY (`food_id`) REFERENCES `staple_food` (`food_id`),
  ADD CONSTRAINT `supply_records_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
