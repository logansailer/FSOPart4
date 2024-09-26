const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return "no blogs";
  } else {
    let total = 0;
    blogs.map((blog) => (total += blog.likes));
    return total;
  }
};

module.exports = {
  dummy,
  totalLikes,
};
