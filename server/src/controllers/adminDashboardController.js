const dashboardService = require('../services/dashboardService');
const { catchAsync } = require('../middleware/errorHandler');

const getStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  res.json({
    success: true,
    data: stats,
  });
});

module.exports = {
  getStats,
};
