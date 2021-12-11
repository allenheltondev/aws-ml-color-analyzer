exports.handler = async (state) => {
  state.results.sort((a, b) => (a.boundingBox.left > b.boundingBox.left) ? 1 : -1);

  const sortedColors = state.results.map(r => r.color);
  return { order: sortedColors }
};