const CourseMaterialRepository = require('../domain/repositories/CourseMaterialRepository');
const CourseRepository = require('../domain/repositories/CourseRepository');
const ApiError = require('../middlewares/ApiError');

class CourseMaterialService {
    static async getAllCourseMaterials() {
        try {
            return await CourseMaterialRepository.getAllCourseMaterials();
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getCourseMaterialById(id) {
        try {
            const mat = await CourseMaterialRepository.getCourseMaterialById(id);
            if (!mat) throw ApiError.notFound(`Course Material ID ${id} not found`);
            return mat;
        } catch (e) {
            throw e;
        }
    }

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
