jest.mock('../../src/domain/repositories/CourseMaterialRepository', () => ({
    getAllCourseMaterials: jest.fn(),
    getCourseMaterialById: jest.fn(),
    createCourseMaterial: jest.fn(),
    updateCourseMaterial: jest.fn(),
    deleteCourseMaterial: jest.fn(),
    materialExists: jest.fn(),
}));

jest.mock('../../src/domain/repositories/CourseRepository', () => ({
    courseExistsById: jest.fn(),
}));

const CourseMaterialService = require('../../src/services/CourseMaterialService');
const CourseMaterialRepository = require('../../src/domain/repositories/CourseMaterialRepository');
const CourseRepository = require('../../src/domain/repositories/CourseRepository');

describe('CourseMaterialService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all course materials', async () => {
        const materials = [{ materialId: 1, title: 'Week 1' }];
        CourseMaterialRepository.getAllCourseMaterials.mockResolvedValue(materials);

        const result = await CourseMaterialService.getAllCourseMaterials();

        expect(result).toEqual(materials);
    });

    it('should wrap getAllCourseMaterials repository errors', async () => {
        CourseMaterialRepository.getAllCourseMaterials.mockRejectedValue(new Error('db down'));

        await expect(CourseMaterialService.getAllCourseMaterials()).rejects.toThrow('db down');
    });

    it('should return 404 when material is not found by id', async () => {
        CourseMaterialRepository.getCourseMaterialById.mockResolvedValue(null);

        await expect(CourseMaterialService.getCourseMaterialById(9)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course Material ID 9 not found',
        });
    });

    it('should return material by id when found', async () => {
        const material = { materialId: 9, title: 'Week 1 Slides' };
        CourseMaterialRepository.getCourseMaterialById.mockResolvedValue(material);

        const result = await CourseMaterialService.getCourseMaterialById(9);

        expect(result).toEqual(material);
    });

    it('should return 404 when creating material for missing course', async () => {
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(
            CourseMaterialService.createCourseMaterial({
                courseId: 99,
                title: 'Slides',
                materialType: 'pdf',
                filePath: 'https://example.com/slides.pdf',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 99 not found',
        });
    });

    it('should create and return course material', async () => {
        const payload = {
            courseId: 1,
            title: 'Slides',
            materialType: 'pdf',
            filePath: 'https://example.com/slides.pdf',
        };
        const created = { materialId: 6, ...payload };

        CourseRepository.courseExistsById.mockResolvedValue(true);
        CourseMaterialRepository.createCourseMaterial.mockResolvedValue(6);
        CourseMaterialRepository.getCourseMaterialById.mockResolvedValue(created);

        const result = await CourseMaterialService.createCourseMaterial(payload);

        expect(CourseMaterialRepository.createCourseMaterial).toHaveBeenCalledWith(payload);
        expect(result).toEqual(created);
    });

    it('should return 404 when updating a missing material', async () => {
        CourseMaterialRepository.materialExists.mockResolvedValue(false);

        await expect(
            CourseMaterialService.updateCourseMaterial(3, {
                courseId: 1,
                title: 'Updated',
                materialType: 'video',
                filePath: 'https://example.com/video.mp4',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course Material ID 3 not found',
        });
    });

    it('should return 404 when updating material with missing course', async () => {
        CourseMaterialRepository.materialExists.mockResolvedValue(true);
        CourseRepository.courseExistsById.mockResolvedValue(false);

        await expect(
            CourseMaterialService.updateCourseMaterial(3, {
                courseId: 99,
                title: 'Updated',
                materialType: 'video',
                filePath: 'https://example.com/video.mp4',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course ID 99 not found',
        });
    });

    it('should update and return material', async () => {
        const payload = {
            courseId: 1,
            title: 'Updated',
            materialType: 'video',
            filePath: 'https://example.com/video.mp4',
        };
        const updated = { materialId: 3, ...payload };

        CourseMaterialRepository.materialExists.mockResolvedValue(true);
        CourseRepository.courseExistsById.mockResolvedValue(true);
        CourseMaterialRepository.updateCourseMaterial.mockResolvedValue(1);
        CourseMaterialRepository.getCourseMaterialById.mockResolvedValue(updated);

        const result = await CourseMaterialService.updateCourseMaterial(3, payload);

        expect(CourseMaterialRepository.updateCourseMaterial).toHaveBeenCalledWith(3, payload);
        expect(result).toEqual(updated);
    });

    it('should return 404 when deleting missing material', async () => {
        CourseMaterialRepository.materialExists.mockResolvedValue(false);

        await expect(CourseMaterialService.deleteCourseMaterial(3)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Course Material ID 3 not found',
        });
    });

    it('should delete material when it exists', async () => {
        CourseMaterialRepository.materialExists.mockResolvedValue(true);

        await CourseMaterialService.deleteCourseMaterial(3);

        expect(CourseMaterialRepository.deleteCourseMaterial).toHaveBeenCalledWith(3);
    });
});
