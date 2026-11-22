const reportService = require('../services/reportService');
const { catchAsync } = require('../middleware/errorHandler');

const getSalesReport = catchAsync(async (req, res) => {
  const report = await reportService.getSalesReport(req.query);
  res.status(200).json({
    success: true,
    data: report,
  });
});

module.exports = {
  getSalesReport,
};
