const catchAsync = (asyncFN) => {
  return (req, res, next) => {
    asyncFN(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
