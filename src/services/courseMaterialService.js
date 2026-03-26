const CourseMaterialRepository = require('../domain/repositories/CourseMaterialRepository');
const CourseRepository = require('../domain/repositories/CourseRepository');
const ApiError = require('../middlewares/ApiError');

const CourseMaterialRepository = require('../domain/repositories/CourseMaterialRepository');
const CourseRepository = require('../domain/repositories/CourseRepository');
const ApiError = require('../middlewares/ApiError');

/**
 * Service class handling course material business logic.
 */
class CourseMaterialService {
    /**
     * Retrieves all course materials.
     * @returns {Promise<Array<Object>>} A list of all course materials.
     * @throws {Error} If retrieving course materials fails.
     */
    static async getAllCourseMaterials() {
        try {
            return await CourseMaterialRepository.getAllCourseMaterials();
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Retrieves a specific course material by its ID.
     * @param {number|string} id - The ID of the course material.
     * @returns {Promise<Object>} The course material object.
     * @throws {ApiError} 404 if the material is not found.
     */
    static async getCourseMaterialById(id) {
        try {
            const mat = await CourseMaterialRepository.getCourseMaterialById(id);
            if (!mat) throw ApiError.notFound(`Course Material ID ${id} not found`);
            return mat;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new course material.
     * @param {Object} data - The material creation data.
     * @param {number|string} data.courseId - The ID of the associated course.
     * @param {string} data.title - The material title.
     * @param {string} data.materialType - The type of material.
     * @param {string} data.filePath - The file path or URL for the material.
     * @returns {Promise<Object>} The newly created course material.
     * @throws {ApiError} 404 if the course ID is not found.
     */
    static async createCourseMaterial(data) {
        try {
            if (!(await CourseRepository.courseExistsById(data.courseId))) {
                throw ApiError.notFound(`Course ID ${data.courseId} not found`);
            }
            const id = await CourseMaterialRepository.createCourseMaterial(data);
            return await CourseMaterialRepository.getCourseMaterialById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Updates an existing course material.
     * @param {number|string} id - The ID of the material to update.
     * @param {Object} data - The updated material data.
     * @param {number|string} data.courseId - The new or existing course ID.
     * @param {string} data.title - The new title.
     * @param {string} data.materialType - The new material type.
     * @param {string} data.filePath - The new file path.
     * @returns {Promise<Object>} The updated course material.
     * @throws {ApiError} 404 if the material or the associated course is not found.
     */
    static async updateCourseMaterial(id, data) {
        try {
            if (!(await CourseMaterialRepository.materialExists(id))) {
                throw ApiError.notFound(`Course Material ID ${id} not found`);
            }
            if (!(await CourseRepository.courseExistsById(data.courseId))) {
                throw ApiError.notFound(`Course ID ${data.courseId} not found`);
            }
            await CourseMaterialRepository.updateCourseMaterial(id, data);
            return await CourseMaterialRepository.getCourseMaterialById(id);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deletes a course material.
     * @param {number|string} id - The ID of the material to delete.
     * @returns {Promise<void>} Resolves when the material is successfully deleted.
     * @throws {ApiError} 404 if the material is not found.
     */
    static async deleteCourseMaterial(id) {
        try {
            if (!(await CourseMaterialRepository.materialExists(id))) {
                throw ApiError.notFound(`Course Material ID ${id} not found`);
            }
            await CourseMaterialRepository.deleteCourseMaterial(id);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = CourseMaterialService;
