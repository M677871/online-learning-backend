const db = require("../config/db");
const Category = require("../models/categoryModel");
const Student = require("../models/studentModel");
const Instructor = require("../models/instructorModel");

/**
 * The `CategoryRepository` class provides a set of static methods to interact with the `categories` table in the database.
 * It allows for the creation, retrieval, updating, deletion, 
 * and querying of categories, as well as related data such as courses and instructors.
 * 
 * @class
 * 
 */

class CategoryRepository {
    
    /**
     * Creates a new category in the database.
     * @param {Object} category The category to be created.
     * @returns {number} The number of affected rows.
     * @throws {Error} If an error occurs during the creation process.
     */
    static async createCategory(category) {
        try {
            const query = `INSERT INTO categories (category_name , description) VALUES (?,?)`;
            const { affectedRows } = await db.query(query, [
                category.categoryName,
                category.description
            ]);
            return affectedRows;
        } catch (error) {
            throw new Error("Error creating category: " + error.message);
        }
}
/**
     * Retrieves a category by its ID.
     * @param {number} categoryId The ID of the category to retrieve.
     * @returns {Category} The category object.
     * @throws {Error} If an error occurs during the fetch operation.
     */
static async getCategoryById(categoryId) {
    try {
        const query = "SELECT * FROM categories WHERE category_id = ?";
        const rows = await db.query(query, [categoryId]);
        return Category.fromRow(rows[0]);
    } catch (error) {
        throw new Error("Error fetching category: " + error.message);
    }
}
  /**
     * Retrieves all categories from the database.
     * @returns {Array<Category>} An array of category objects.
     * @throws {Error} If an error occurs during the fetch operation.
     */
static async getAllCategories() {
    try {
        const query = "SELECT * FROM categories";
        const rows = await db.query(query);
        return rows.map(Category.fromRow);
    } catch (error) {
        throw new Error("Error fetching all categories: " + error.message);
    }
}

    /**
     * Updates an existing category in the database.
     * @param {Object} category The updated category data.
     * @returns {number} The number of affected rows.
     * @throws {Error} If an error occurs during the update operation.
     */
static async updateCategory(category) {
    try {
        const query = `UPDATE categories SET category_name=?,description=? WHERE category_id = ?`;
        const { affectedRows } = await db.query(query, [
            category.categoryName,
            category.description,
            category.categoryId
        ]);
        return affectedRows;
    } catch (error) {
        throw new Error("Error updating category: " + error.message);
    }
}
  /**
     * Deletes a category from the database.
     * @param {number} categoryId The ID of the category to delete.
     * @returns {number} The number of affected rows.
     * @throws {Error} If an error occurs during the delete operation.
     */
static async deleteCategory(categoryId) {
    try {
        const query = `DELETE FROM categories WHERE category_id = ?`;
        const { affectedRows } = await db.query(query, [categoryId]);
        return affectedRows;
    } catch (error) {
        throw new Error("Error deleting category: " + error.message);
    }
}
/**
     * Retrieves all courses belonging to a category.
     * @param {number} categoryId The ID of the category.
     * @returns {Array<Object>} An array of course objects.
     * @throws {Error} If an error occurs during the fetch operation.
     */
static async getCategoryCourses(categoryId) {
    try {
        const query = `SELECT * FROM courses WHERE categorie_id = ?`;
        const rows = await db.query(query, [categoryId]);
        return rows;
    } catch (error) {
        throw new Error("Error fetching category courses: " + error.message);
    }
}
 /**
     * Retrieves all instructors that teach courses in a specific category.
     * @param {number} categoryId The ID of the category.
     * @returns {Array<Object>} An array of instructor objects.
     * @throws {Error} If an error occurs during the fetch operation.
     */
static async getCategoryInstructors(categoryId) {
    try {
        const query = `SELECT * FROM instructors WHERE instructor_id IN (SELECT instructor_id FROM courses WHERE categorie_id = ?)`; 
        const rows = await db.query(query, [categoryId]);
        return rows.length > 0 ? rows.map(Instructor.fromRow) : null;
    } catch (error) {
        throw new Error("Error fetching category instructors: " + error.message);
    }
}

/**
     * Retrieves all students enrolled in courses within a specific category.
     * @param {number} categoryId The ID of the category.
     * @returns {Array<Object>} An array of student objects.
     * @throws {Error} If an error occurs during the fetch operation.
     */

static async getcategoryStudents(categoryId) {
    try {
        const query = `SELECT * FROM students WHERE student_id IN (SELECT student_id FROM enrollements 
        WHERE course_id IN (SELECT course_id FROM courses WHERE categorie_id = ?))`;
        const rows = await db.query(query, [categoryId]);
        return rows.length > 0 ? rows.map(Student.fromRow) : null;
    } catch (error) {
        throw new Error("Error fetching category students: " + error.message);
    }
}

/**
     * Retrieves a category by its name.
     * @param {string} categoryName The name of the category to retrieve.
     * @returns {Category} The category object.
     * @throws {Error} If an error occurs during the fetch operation.
     */

static async getCategoryByName(categoryName) {
    try {
        const query = `SELECT * FROM categories WHERE category_name = ?`;
        const rows = await db.query(query, [categoryName]);
        return rows.length > 0 ? Category.fromRow[rows[0]] : null;
    } catch (error) {
        throw new Error("Error fetching category by name: " + error.message);
    }
}
 /**
     * Checks if a category exists by its ID.
     * @param {number} categoryId The ID of the category to check.
     * @returns {boolean} True if the category exists, false otherwise.
     * @throws {Error} If an error occurs during the check operation.
     */
static async isCategoryExists(categoryId) {
    try {
        const query = `SELECT * FROM categories WHERE category_id = ?`;
        const rows = await db.query(query, [categoryId]);
        return rows.length > 0 ? true : false;
    } catch (error) {
        throw new Error("Error checking category: " + error.message);
    }
}

}
module.exports = CategoryRepository;