function initReportCharts() {

    // FARM TYPES
    const farmTypes = {};
    state.farmers.forEach(f => {
        farmTypes[f.farm_type] = (farmTypes[f.farm_type] || 0) + 1;
    });

    new Chart(document.getElementById("chartFarmTypes"), {
        type: "pie",
        data: {
            labels: Object.keys(farmTypes),
            datasets: [{
                data: Object.values(farmTypes),
                backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]
            }]
        }
    });

    // ASSISTANCE STATUS
    const statusCount = { Released: 0, Processing: 0, Cancelled: 0 };
    state.assistance.forEach(a => statusCount[a.status]++);

    new Chart(document.getElementById("chartAssistanceStatus"), {
        type: "doughnut",
        data: {
            labels: Object.keys(statusCount),
            datasets: [{
                data: Object.values(statusCount),
                backgroundColor: ["#10b981", "#f59e0b", "#ef4444"]
            }]
        }
    });

    // DISTRIBUTION BY PROGRAM
    const programCount = {};
    state.distributions.forEach(d => {
        programCount[d.program] = (programCount[d.program] || 0) + Number(d.quantity || 0);
    });

    new Chart(document.getElementById("chartPrograms"), {
        type: "bar",
        data: {
            labels: Object.keys(programCount),
            datasets: [{
                label: "Units Distributed",
                data: Object.values(programCount),
                backgroundColor: "#3b82f6"
            }]
        }
    });
}
