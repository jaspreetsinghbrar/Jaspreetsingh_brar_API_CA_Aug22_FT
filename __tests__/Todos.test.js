const request = require('supertest');
const app = require('../app');
const db = require('../models');

describe('Todo API', () => {
  let token;


  afterAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  describe('POST /users/signup', () => {

    it('should create a new user and return 201 status code', async () => {
      const res = await request(app)
        .post('/users/signup')
        .send({ username: 'testuser', email: 'testuser@test.com', password: 'password' });
      expect(res.statusCode).toEqual(201);
    });

    it('should return 400 status code if email is already taken', async () => {
      const res = await request(app)
        .post('/users/signup')
        .send({ username: 'testuser', email: 'testuser@test.com', password: 'password' });
      expect(res.statusCode).toEqual(400);
    });

    it('should return 500 status code if server error occurs', async () => {
      const res = await request(app)
        .post('/users/signup')
        .send({ username: 'testuser', email: 'invalidemail', password: 'password' });
      expect(res.statusCode).toEqual(500);
    });
  });

  describe('POST /users/login', () => {

    it('should create a new user and return 201 status code', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'testuser@test.com', password: 'password' });
      token = res.body.token;
      expect(res.statusCode).toEqual(200);
    });

    it('should return 400 status code if email wrong', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'wrong@test.com', password: 'password' });
      expect(res.statusCode).toEqual(401);
    });

    it('should return 400 status code if password wrong', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'testuser@test.com', password: 'wrong_pass' });
      expect(res.statusCode).toEqual(401);
    });

    it('should return 500 status code if server error occurs', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'invalidemail', password: 'password' });
      expect(res.statusCode).toEqual(500);
    });
  });




  describe('POST /category', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/category')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(response.body.data.categories).toBeDefined();
    });

    it('should return 401 error when token is not provided', async () => {
      const response = await request(app)
        .get('/category')
        .expect(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 error when an invalid token is provided', async () => {
      const response = await request(app)
        .get('/category')
        .set('Authorization', `Bearer invalid_token`)
        .expect(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });


  describe('POST /category/create', () => {

    it('should return status 201 and success message for a new category', async () => {
      const response = await request(app)
        .post('/category/create')
        .send({
          name: 'Work'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Category created successfully');
    });

    it('should return status 404 and error message for an existing category', async () => {
      const response = await request(app)
        .post('/category/create')
        .send({
          name: 'Work'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Category already existed!');
    });

    it('should return status 400 and error message for invalid request', async () => {
      const response = await request(app)
        .post('/category/create')
        .send({})
        .set('Authorization', `Bearer ${token}`);
      console.log('response=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', response);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Error creating category');
    });
  });


  describe('PUT /category/edit', () => {

    beforeAll(async () => {
      await request(app)
        .post('/category/create')
        .send({
          name: 'Work2'
        })
        .set('Authorization', `Bearer ${token}`);
    });


    it('should edit a Category', async () => {
      const editedCategory = {
        name: 'Edited Work',
        categoryName: 'Work2'
      };

      const response = await request(app)
        .put('/category/edit')
        .set('Authorization', `Bearer ${token}`)
        .send(editedCategory);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Category updated successfully');
    });

    it('should return an error if Category not found or user does not have permission', async () => {
      const editedCategory = {
        name: 'Edited Category',
        categoryName: 'non-existent Category'
      };

      const response = await request(app)
        .put('/category/edit')
        .set('Authorization', `Bearer ${token}`)
        .send(editedCategory);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Category not found or user does not have permission');
    });

    it('should return an error if token is not provided', async () => {
      const editedCategory = {
        name: 'Edited Twice Category',
        categoryName: 'Edited Work'
      };

      const response = await request(app)
        .put('/category/edit')
        .send(editedCategory);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return an error if token is invalid', async () => {
      const editedCategory = {
        name: 'Edited Twice Category',
        categoryName: 'Edited Work'
      };

      const response = await request(app)
        .put('/category/edit')
        .set('Authorization', `Bearer invalidtoken`)
        .send(editedCategory);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });


  describe('DELETE /category/delete', () => {

    it('should return a 404 error if the category does not exist', async () => {
      const response = await request(app)
        .delete('/category/delete')
        .set('Authorization', `Bearer ${token}`)
        .send({
          categoryName: 'Nonexistent Category'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Category not found or user does not have permission');
    });

    it('should return a 401 error if the JWT token is not provided', async () => {
      const response = await request(app)
        .delete('/category/delete')
        .send({
          categoryName: 'Edited Work'
        });

      expect(response.status).toBe(401);
    });

    it('should return a 401 error if the JWT token is invalid', async () => {
      const response = await request(app)
        .delete('/category/delete')
        .set('Authorization', `Bearer invalidToken`)
        .send({
          categoryName: 'Edited Work'
        });

      expect(response.status).toBe(401);
    });

    it('should delete the specified Category', async () => {
      const response = await request(app)
        .delete('/category/delete')
        .set('Authorization', `Bearer ${token}`)
        .send({
          categoryName: 'Edited Work'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Category deleted successfully');
    });

  });




  describe('POST /', () => {
    it('should return all todos for the user with a valid token', async () => {
      const response = await request(app)
        .get('/')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(response.body.data.todos).toBeDefined();
    });

    it('should return 401 error when token is not provided', async () => {
      const response = await request(app)
        .get('/')
        .expect(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 error when an invalid token is provided', async () => {
      const response = await request(app)
        .get('/')
        .set('Authorization', `Bearer invalid_token`)
        .expect(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('POST /create', () => {

    it('should insert a new todo', async () => {
      const res = await request(app)
        .post('/create')
        .send({ name: 'New Todo', category: 'Work' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toEqual('New Todo');
      expect(res.body.CategoryId).toBeDefined();
      expect(res.body.UserId).toBeDefined();
    });

    it('should return an error if todo creation fails', async () => {
      const res = await request(app)
        .post('/create')
        .send({ name: 'New Todo', category: 'Invalid Category' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Error creating todo');
      expect(res.body.error).toBeDefined();
    });

    it('should return an error if JWT token is not provided', async () => {
      const res = await request(app)
        .post('/create')
        .send({ name: 'New Todo', category: 'Work' });

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toEqual('Unauthorized');
    });

    it('should return an error if JWT token is invalid', async () => {
      const res = await request(app)
        .post('/create')
        .send({ name: 'New Todo', category: 'Work' })
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toEqual('Unauthorized');
    });
  });


  describe('PUT /edit', () => {

    it('should edit a Todo', async () => {
      const editedTodo = {
        name: 'Edited Todo',
        todoName: 'New Todo'
      };

      const response = await request(app)
        .put('/edit')
        .set('Authorization', `Bearer ${token}`)
        .send(editedTodo);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Todo updated successfully');
    });

    it('should return an error if Todo not found or user does not have permission', async () => {
      const editedTodo = {
        name: 'Edited Todo',
        todoName: 'non-existent Todo'
      };

      const response = await request(app)
        .put('/edit')
        .set('Authorization', `Bearer ${token}`)
        .send(editedTodo);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Todo not found or user does not have permission');
    });

    it('should return an error if token is not provided', async () => {
      const editedTodo = {
        name: 'Edited Twice Todo',
        todoName: 'Edited Todo'
      };

      const response = await request(app)
        .put('/edit')
        .send(editedTodo);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return an error if token is invalid', async () => {
      const editedTodo = {
        name: 'Edited Twice Todo',
        todoName: 'Edited Todo'
      };

      const response = await request(app)
        .put('/edit')
        .set('Authorization', `Bearer invalidtoken`)
        .send(editedTodo);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });


  describe('DELETE /delete', () => {

    it('should return a 404 error if the todo does not exist', async () => {
      const response = await request(app)
        .delete('/delete')
        .set('Authorization', `Bearer ${token}`)
        .send({
          todoName: 'Nonexistent Todo'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Todo not found or user does not have permission');
    });

    it('should return a 401 error if the JWT token is not provided', async () => {
      const response = await request(app)
        .delete('/delete')
        .send({
          todoName: 'Test Todo'
        });

      expect(response.status).toBe(401);
    });

    it('should return a 401 error if the JWT token is invalid', async () => {
      const response = await request(app)
        .delete('/delete')
        .set('Authorization', `Bearer invalidToken`)
        .send({
          todoName: 'Test Todo'
        });

      expect(response.status).toBe(401);
    });

    it('should delete the specified todo', async () => {
      const response = await request(app)
        .delete('/delete')
        .set('Authorization', `Bearer ${token}`)
        .send({
          todoName: 'Edited Todo'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Todo deleted successfully');
    });

  });

});
