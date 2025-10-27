const searchService = require("./search.service");

exports.globalSearch = async (req, res) => {
  try {
    const { q, type } = req.query;

    const result = await searchService.search(q, type);

    return res
      .status(result.status)
      .json(
        result.success
          ? { success: true, ...result.data }
          : { success: false, message: result.message, details: result.details }
      );
  } catch (error) {
    console.error("SearchController Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};
