import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Rec, Folder, Book, Friend, Post, User, WebSession } from "./app";
import { BookDoc } from "./concepts/book";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  @Router.get("/books")
  async getBooks(title?: string) {
    let books;
    if (title) {
      books = await Book.getBooks({ title });
    } else {
      books = await Book.getBooks({});
    }
    return books;
    // return Responses.posts(posts);
  }

  @Router.patch("/books/:_id")
  async updateBook(_id: ObjectId, update: Partial<BookDoc>) {
    return await Book.updateInfo(_id, update);
  }

  @Router.post("/books/:_id/rating")
  async addRating(_id: ObjectId) {
    // return await Book.updateInfo(_id, update);
  }

  @Router.get("/user/:username/folders")
  async getUserFolders(session: WebSessionDoc, username: string) {
    const userId = (await User.getUserByUsername(username))._id;
    const folders = await Folder.getFolders({ owner: userId });
    return folders;
    // return Responses.posts(posts);
  }

  @Router.get("/user/:username/folders/:folderName")
  async getUserFolderContents(session: WebSessionDoc, username: string, folderName: string) {
    const userId = (await User.getUserByUsername(username))._id;
    const items = await Folder.getUserFolderContents({ owner: userId, name: folderName });
    return items;
  }

  @Router.post("/user/:username/folders/:folderName")
  async addFolder(username: string, folderName: string) {
    const userId = (await User.getUserByUsername(username))._id;
    return await Folder.addNewFolder(userId, folderName);
  }

  @Router.patch("/user/:username/folders/:folderName")
  async addToFolder(session: WebSessionDoc, username: string, folderName: string, bookId: ObjectId) {
    const userId = (await User.getUserByUsername(username))._id;
    return await Folder.addToFolder({ owner: userId, name: folderName }, bookId);
    // todo: also add syncs
  }

  @Router.get("/user/:username/recommendations")
  async getUserRecommendations(username: string) {
    const userId = (await User.getUserByUsername(username))._id;
    const recs = await Rec.getUserRecs({ userTo: userId });
    return recs;
  }

  @Router.post("/books/:_id")
  async sendRecommendation(_id: ObjectId, usernameTo: string, usernameFrom: string) {
    console.log("data:", _id, usernameTo, usernameFrom);
    const userToId = (await User.getUserByUsername(usernameTo))._id;
    const userFromId = (await User.getUserByUsername(usernameFrom))._id;
    // // const book = (await Book.getBookByTitle(bookTitle))._id;
    return await Rec.sendRec(userFromId, userToId, _id);
  }

  @Router.get("/user/invitations/received")
  async getUserInvitationsReceived(session: WebSessionDoc) {
    return;
  }

  @Router.get("/user/invitations/posted")
  async getUserInvitationPosted(session: WebSessionDoc) {
    return;
  }

  @Router.post("/user/invitations/posted")
  async postInvitation(session: WebSessionDoc) {
    return;
  }
}

export default getExpressRouter(new Routes());
