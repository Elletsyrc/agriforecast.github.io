<?php
// ================================================================
// AGRIFORECAST - API Endpoints
// ================================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// Get the request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch($action) {
    // AUTHENTICATION
    case 'login':
        login();
        break;

    // USERS
    case 'get_users':
        getUsers();
        break;
    case 'add_user':
        addUser();
        break;
    case 'update_user':
        updateUser();
        break;
    case 'delete_user':
        deleteUser();
        break;

    // FARMERS
    case 'get_farmers':
        getFarmers();
        break;
    case 'add_farmer':
        addFarmer();
        break;
    case 'update_farmer':
        updateFarmer();
        break;
    case 'delete_farmer':
        deleteFarmer();
        break;

    // COOPERATIVES
    case 'get_cooperatives':
        getCooperatives();
        break;
    case 'add_cooperative':
        addCooperative();
        break;
    case 'delete_cooperative':
        deleteCooperative();
        break;

    // FARM INPUTS
    case 'get_inputs':
        getInputs();
        break;
    case 'add_input':
        addInput();
        break;
    case 'update_input':
        updateInput();
        break;
    case 'delete_input':
        deleteInput();
        break;

    // DISTRIBUTIONS
    case 'get_distributions':
        getDistributions();
        break;
    case 'add_distribution':
        addDistribution();
        break;
    case 'delete_distribution':
        deleteDistribution();
        break;

    // ASSISTANCE
    case 'get_assistance':
        getAssistance();
        break;
    case 'add_assistance':
        addAssistance();
        break;
    case 'delete_assistance':
        deleteAssistance();
        break;

    // FOOD SUPPLY
    case 'get_food_supply':
        getFoodSupply();
        break;
    case 'add_food_supply':
        addFoodSupply();
        break;
    case 'update_food_supply':
        updateFoodSupply();
        break;
    case 'delete_food_supply':
        deleteFoodSupply();
        break;

    case 'get_supply_records_direct':
        getSupplyRecordsDirect();
        break;

    // PRICES
    case 'get_prices':
        getPrices();
        break;
    case 'add_price':
        addPrice();
        break;
    case 'update_price':
        updatePrice();
        break;
    case 'delete_price':
        deletePrice();
        break;

    // DASHBOARD STATS
    case 'get_stats':
        getStats();
        break;

    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

// ================================================================
// AUTHENTICATION FUNCTIONS
// ================================================================

function login() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND status = 'Active'");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        unset($user['password_hash']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    }
}

// ================================================================
// USER FUNCTIONS
// ================================================================

function getUsers() {
    global $pdo;
    $stmt = $pdo->query("SELECT user_id, username, full_name, email, role, status, created_at FROM users ORDER BY user_id");
    $users = $stmt->fetchAll();
    echo json_encode($users);
}

function addUser() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, full_name, email, role, status) VALUES (?, ?, ?, ?, ?, ?)");
    $success = $stmt->execute([
        $data['username'],
        password_hash($data['password'], PASSWORD_DEFAULT),
        $data['full_name'],
        $data['email'],
        $data['role'],
        $data['status']
    ]);

    echo json_encode(['success' => $success, 'id' => $pdo->lastInsertId()]);
}

function updateUser() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    if (!empty($data['password'])) {
        $stmt = $pdo->prepare("UPDATE users SET username=?, password_hash=?, full_name=?, email=?, role=?, status=? WHERE user_id=?");
        $success = $stmt->execute([
            $data['username'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['full_name'],
            $data['email'],
            $data['role'],
            $data['status'],
            $data['user_id']
        ]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET username=?, full_name=?, email=?, role=?, status=? WHERE user_id=?");
        $success = $stmt->execute([
            $data['username'],
            $data['full_name'],
            $data['email'],
            $data['role'],
            $data['status'],
            $data['user_id']
        ]);
    }

    echo json_encode(['success' => $success]);
}

function deleteUser() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
    $success = $stmt->execute([$data['user_id']]);
    echo json_encode(['success' => $success]);
}

// ================================================================
// FARMER FUNCTIONS
// ================================================================

function getFarmers() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM farmers ORDER BY farmer_id");
    $farmers = $stmt->fetchAll();
    echo json_encode($farmers);
}

function addFarmer() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("INSERT INTO farmers (full_name, contact_number, farm_location, farm_size_ha, farm_type, status) VALUES (?, ?, ?, ?, ?, ?)");
    $success = $stmt->execute([
        $data['full_name'],
        $data['contact_number'],
        $data['farm_location'],
        $data['farm_size_ha'],
        $data['farm_type'],
        $data['status']
    ]);

    echo json_encode(['success' => $success, 'id' => $pdo->lastInsertId()]);
}

function updateFarmer() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("UPDATE farmers SET full_name=?, contact_number=?, farm_location=?, farm_size_ha=?, farm_type=?, status=? WHERE farmer_id=?");
    $success = $stmt->execute([
        $data['full_name'],
        $data['contact_number'],
        $data['farm_location'],
        $data['farm_size_ha'],
        $data['farm_type'],
        $data['status'],
        $data['farmer_id']
    ]);

    echo json_encode(['success' => $success]);
}

function deleteFarmer() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM farmers WHERE farmer_id = ?");
    $success = $stmt->execute([$data['farmer_id']]);
    echo json_encode(['success' => $success]);
}

// ================================================================
// COOPERATIVE FUNCTIONS
// ================================================================

function getCooperatives() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM cooperatives ORDER BY cooperative_id");
    $cooperatives = $stmt->fetchAll();
    echo json_encode($cooperatives);
}

function addCooperative() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("INSERT INTO cooperatives (name, location, contact_person, contact_number) VALUES (?, ?, ?, ?)");
    $success = $stmt->execute([
        $data['name'],
        $data['location'],
        $data['contact_person'],
        $data['contact_number']
    ]);

    echo json_encode(['success' => $success, 'id' => $pdo->lastInsertId()]);
}

function deleteCooperative() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM cooperatives WHERE cooperative_id = ?");
    $success = $stmt->execute([$data['cooperative_id']]);
    echo json_encode(['success' => $success]);
}

// ================================================================
// FARM INPUT FUNCTIONS
// ================================================================

function getInputs() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM farm_inputs ORDER BY input_id");
    $inputs = $stmt->fetchAll();
    echo json_encode($inputs);
}

function addInput() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("INSERT INTO farm_inputs (name, category, unit, stock_quantity, supplier) VALUES (?, ?, ?, ?, ?)");
    $success = $stmt->execute([
        $data['name'],
        $data['category'],
        $data['unit'],
        $data['stock_quantity'],
        $data['supplier']
    ]);

    echo json_encode(['success' => $success, 'id' => $pdo->lastInsertId()]);
}

function updateInput() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("UPDATE farm_inputs SET name=?, category=?, unit=?, stock_quantity=?, supplier=? WHERE input_id=?");
    $success = $stmt->execute([
        $data['name'],
        $data['category'],
        $data['unit'],
        $data['stock_quantity'],
        $data['supplier'],
        $data['input_id']
    ]);

    echo json_encode(['success' => $success]);
}

function deleteInput() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM farm_inputs WHERE input_id = ?");
    $success = $stmt->execute([$data['input_id']]);
    echo json_encode(['success' => $success]);
}

// ================================================================
// DISTRIBUTION FUNCTIONS
// ================================================================

function getDistributions() {
    global $pdo;
    $stmt = $pdo->query("SELECT d.*, fi.name as input_name, f.full_name as farmer_name
                         FROM distributions d
                         LEFT JOIN farm_inputs fi ON d.input_id = fi.input_id
                         LEFT JOIN farmers f ON d.farmer_id = f.farmer_id
                         ORDER BY d.distribution_date DESC");
    $distributions = $stmt->fetchAll();
    echo json_encode($distributions);
}

function addDistribution() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    try {
        $pdo->beginTransaction();

        // Call stored procedure
        $stmt = $pdo->prepare("CALL sp_record_distribution(?, ?, ?, ?, ?, ?, ?)");
        $success = $stmt->execute([
            $data['input_id'],
            $data['farmer_id'] ?? null,
            $data['cooperative_id'] ?? null,
            $data['distributed_by'],
            $data['quantity'],
            $data['program'],
            $data['distribution_date']
        ]);

        $pdo->commit();
        echo json_encode(['success' => $success]);
    } catch(Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function deleteDistribution() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM distributions WHERE distribution_id = ?");
    $success = $stmt->execute([$data['distribution_id']]);
    echo json_encode(['success' => $success]);
}

// ================================================================
// ASSISTANCE FUNCTIONS
// ================================================================

function getAssistance() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM assistance_records ORDER BY date_given DESC");
    $assistance = $stmt->fetchAll();
    echo json_encode($assistance);
}

function addAssistance() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("INSERT INTO assistance_records (farmer_id, cooperative_id, program_name, support_type, value_amount, given_by, date_given, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $success = $stmt->execute([
        $data['farmer_id'] ?? null,
        $data['cooperative_id'] ?? null,
        $data['program_name'],
        $data['support_type'],
        $data['value_amount'],
        $data['given_by'],
        $data['date_given'],
        $data['status']
    ]);

    echo json_encode(['success' => $success, 'id' => $pdo->lastInsertId()]);
}

function deleteAssistance() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM assistance_records WHERE assistance_id = ?");
    $success = $stmt->execute([$data['assistance_id']]);
    echo json_encode(['success' => $success]);
}

// ================================================================
// FOOD SUPPLY FUNCTIONS
// ================================================================

function getFoodSupply() {
    global $pdo;
    $stmt = $pdo->query("SELECT * FROM vw_current_supply");
    $supply = $stmt->fetchAll();
    echo json_encode($supply);
}

function addFoodSupply() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    // First add to staple_food if needed
    $stmt = $pdo->prepare("INSERT INTO staple_food (name, category, unit) VALUES (?, ?, ?)");
    $stmt->execute([$data['commodity'], $data['category'], $data['unit']]);
    $food_id = $pdo->lastInsertId();

    // Then add supply record
    $stmt2 = $pdo->prepare("INSERT INTO supply_records (food_id, quantity_available, capacity, unit, location, record_date, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $success = $stmt2->execute([
        $food_id,
        $data['quantity_available'],
        $data['capacity'],
        $data['unit'],
        $data['location'],
        $data['record_date'],
        $data['updated_by']
    ]);

    echo json_encode(['success' => $success]);
}

function updateFoodSupply() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("UPDATE supply_records SET quantity_available=?, record_date=?, updated_by=? WHERE supply_id=?");
    $success = $stmt->execute([
        $data['quantity_available'],
        $data['record_date'],
        $data['updated_by'],
        $data['supply_id']
    ]);

    echo json_encode(['success' => $success]);
}

function deleteFoodSupply() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM supply_records WHERE supply_id = ?");
    $success = $stmt->execute([$data['supply_id']]);
    echo json_encode(['success' => $success]);
}

// ================================================================
// PRICE FUNCTIONS
// ================================================================

function getPrices() {
    global $pdo;
    // Direct query since view doesn't exist
    $stmt = $pdo->query("
        SELECT * FROM price_records
        ORDER BY record_date DESC, price_id DESC
    ");
    $prices = $stmt->fetchAll();
    echo json_encode($prices);
}

function addPrice() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("INSERT INTO price_records (commodity, price, prev_price, unit, market_area, record_date, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $success = $stmt->execute([
        $data['commodity'],
        $data['price'],
        $data['price'], // prev_price same as current for new entries
        $data['unit'],
        $data['market_area'],
        $data['record_date'],
        $data['updated_by']
    ]);

    echo json_encode(['success' => $success]);
}

function updatePrice() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    // Get current price to set as prev_price
    $stmt = $pdo->prepare("SELECT price FROM price_records WHERE price_id = ?");
    $stmt->execute([$data['price_id']]);
    $current = $stmt->fetch();

    $stmt2 = $pdo->prepare("UPDATE price_records SET commodity=?, price=?, prev_price=?, unit=?, market_area=?, record_date=?, updated_by=? WHERE price_id=?");
    $success = $stmt2->execute([
        $data['commodity'],
        $data['price'],
        $current['price'],
        $data['unit'],
        $data['market_area'],
        $data['record_date'],
        $data['updated_by'],
        $data['price_id']
    ]);

    echo json_encode(['success' => $success]);
}

function deletePrice() {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM price_records WHERE price_id = ?");
    $success = $stmt->execute([$data['price_id']]);
    echo json_encode(['success' => $success]);
}

// ================================================================
// DASHBOARD STATS FUNCTIONS
// ================================================================

function getStats() {
    global $pdo;

    $stats = [];

    // Total farmers
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM farmers WHERE status = 'Active'");
    $stats['total_farmers'] = $stmt->fetch()['count'];

    // Total cooperatives
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM cooperatives");
    $stats['total_cooperatives'] = $stmt->fetch()['count'];

    // Total distributions
    $stmt = $pdo->query("SELECT COUNT(*) as count, SUM(quantity) as total_quantity FROM distributions");
    $result = $stmt->fetch();
    $stats['total_distributions'] = $result['count'];
    $stats['total_units_distributed'] = $result['total_quantity'] ?? 0;

    // Total assistance
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM assistance_records");
    $stats['total_assistance'] = $stmt->fetch()['count'];

    // Low stock items
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM supply_records WHERE status = 'Critical'");
    $stats['low_stock_items'] = $stmt->fetch()['count'];

    echo json_encode($stats);
}

function getSupplyRecordsDirect() {
    global $pdo;
    $stmt = $pdo->query("
        SELECT sr.*, sf.name as commodity
        FROM supply_records sr
        LEFT JOIN staple_food sf ON sr.food_id = sf.food_id
        ORDER BY sr.supply_id DESC
    ");
    $records = $stmt->fetchAll();
    echo json_encode($records);
}
?>