const { test, after, beforeEach } = require("node:test");
const Blog = require("../models/blog");
const mongoose = require("mongoose");
const assert = require("node:assert");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
];

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[2]);
  await blogObject.save();
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("the first blog is by Michael Chan", async () => {
  const response = await api.get("/api/blogs");

  const contents = response.body.map((e) => e.author);
  assert(contents.includes("Michael Chan"));
});

test("there are three blogs", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, initialBlogs.length);
});

test("the identifier is named 'id' not '_id'", async () => {
  const response = await api.get("/api/blogs");

  const testNote = response.body[0];
  assert(testNote.hasOwnProperty("id"));
});

test("a valid blog can be added ", async () => {
  const newBlog = {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");

  const contents = response.body.map((r) => r.title);

  assert.strictEqual(response.body.length, initialBlogs.length + 1);

  assert(contents.includes("First class tests"));
});

test("a valid blog can be updated", async () => {
  const allBlogs = await blogsInDb();

  const blogToUpdate = allBlogs.find(
    (blog) => blog.title === "Go To Statement Considered Harmful"
  );

  updated = {
    ...blogToUpdate,
    likes: blogToUpdate.likes + 1,
  };

  await api.put(`/api/blogs/${blogToUpdate.id}`).send(updated);

  const blogsAtEnd = await blogsInDb();

  const afterUpdateLikes = blogsAtEnd.map((r) => r.likes);
  assert.strictEqual(afterUpdateLikes[1], 6);
});

test("a valid blog can be deleted", async () => {
  const blogToDelete = initialBlogs[0];

  await api.delete(`/api/blogs/${blogToDelete._id}`).expect(204);

  const blogsAtEnd = await blogsInDb();

  assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1);

  const afterDelete = blogsAtEnd.map((r) => r.url);
  assert(!afterDelete.includes(blogToDelete.url));
});

after(async () => {
  await mongoose.connection.close();
});
