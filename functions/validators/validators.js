function validateInput(field) {
  if (field.trim() === "") {
    return true;
  } else {
    return false;
  }
}

function parseGenres(genres) {
  const split = genres.split(",");
  const parsed = split.map((el) => {
    if (el.charAt(0) === " ") {
      return el.substr(1);
    } else {
      return el;
    }
  });
  return parsed;
}

module.exports = { validateInput, parseGenres };
