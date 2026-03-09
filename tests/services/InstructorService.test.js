jest.mock('../../src/domain/repositories/InstructorRepository', () => ({
    getAllInstructors: jest.fn(),
    getInstructorById: jest.fn(),
    createInstructor: jest.fn(),
    updateInstructor: jest.fn(),
    deleteInstructor: jest.fn(),
    instructorExists: jest.fn(),
    instructorExistsByUserId: jest.fn(),
    getInstructorCourses: jest.fn(),
}));

jest.mock('../../src/domain/repositories/UserRepository', () => ({
    userExistsById: jest.fn(),
    getUserById: jest.fn(),
}));

const InstructorService = require('../../src/services/InstructorService');
const InstructorRepository = require('../../src/domain/repositories/InstructorRepository');
const UserRepository = require('../../src/domain/repositories/UserRepository');

describe('InstructorService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all instructors', async () => {
        const instructors = [{ instructorId: 1 }];
        InstructorRepository.getAllInstructors.mockResolvedValue(instructors);

        const result = await InstructorService.getAllInstructors();

        expect(result).toEqual(instructors);
    });

    it('should wrap getAllInstructors repository errors', async () => {
        InstructorRepository.getAllInstructors.mockRejectedValue(new Error('db down'));

        await expect(InstructorService.getAllInstructors()).rejects.toThrow('db down');
    });

    it('should return 404 when instructor by id is not found', async () => {
        InstructorRepository.getInstructorById.mockResolvedValue(null);

        await expect(InstructorService.getInstructorById(50)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Instructor ID 50 not found',
        });
    });

    it('should return instructor by id when found', async () => {
        const instructor = { instructorId: 50, userId: 2 };
        InstructorRepository.getInstructorById.mockResolvedValue(instructor);

        const result = await InstructorService.getInstructorById(50);

        expect(result).toEqual(instructor);
    });

    it('should return 404 when creating profile for missing user', async () => {
        UserRepository.userExistsById.mockResolvedValue(false);

        await expect(
            InstructorService.createInstructor({
                userId: 12,
                insFName: 'Jane',
                insLName: 'Doe',
                bio: 'Bio',
                profilePicture: 'https://example.com/jane.png',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'User ID 12 not found',
        });
    });

    it('should return conflict when instructor profile already exists', async () => {
        UserRepository.userExistsById.mockResolvedValue(true);
        InstructorRepository.instructorExistsByUserId.mockResolvedValue(true);

        await expect(
            InstructorService.createInstructor({
                userId: 12,
                insFName: 'Jane',
                insLName: 'Doe',
                bio: 'Bio',
                profilePicture: 'https://example.com/jane.png',
            })
        ).rejects.toMatchObject({
            statusCode: 409,
            message: 'Instructor profile for user ID 12 already exists',
        });
    });

    it('should return bad request when user type is not instructor', async () => {
        UserRepository.userExistsById.mockResolvedValue(true);
        InstructorRepository.instructorExistsByUserId.mockResolvedValue(false);
        UserRepository.getUserById.mockResolvedValue({ userType: 'student' });

        await expect(
            InstructorService.createInstructor({
                userId: 12,
                insFName: 'Jane',
                insLName: 'Doe',
                bio: 'Bio',
                profilePicture: 'https://example.com/jane.png',
            })
        ).rejects.toMatchObject({
            statusCode: 400,
            message: 'User is not an instructor type',
        });
    });

    it('should create and return instructor profile', async () => {
        const payload = {
            userId: 12,
            insFName: 'Jane',
            insLName: 'Doe',
            bio: 'Bio',
            profilePicture: 'https://example.com/jane.png',
        };
        const created = { instructorId: 8, ...payload };

        UserRepository.userExistsById.mockResolvedValue(true);
        InstructorRepository.instructorExistsByUserId.mockResolvedValue(false);
        UserRepository.getUserById.mockResolvedValue({ userType: 'instructor' });
        InstructorRepository.createInstructor.mockResolvedValue(8);
        InstructorRepository.getInstructorById.mockResolvedValue(created);

        const result = await InstructorService.createInstructor(payload);

        expect(InstructorRepository.createInstructor).toHaveBeenCalledWith(payload);
        expect(result).toEqual(created);
    });

    it('should return 404 when updating missing instructor', async () => {
        InstructorRepository.instructorExists.mockResolvedValue(false);

        await expect(
            InstructorService.updateInstructor(7, {
                userId: 1,
                insFName: 'A',
                insLName: 'B',
                bio: 'C',
                profilePicture: 'https://example.com/p.png',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'Instructor ID 7 not found',
        });
    });

    it('should return 404 when updating with missing user', async () => {
        InstructorRepository.instructorExists.mockResolvedValue(true);
        UserRepository.userExistsById.mockResolvedValue(false);

        await expect(
            InstructorService.updateInstructor(7, {
                userId: 2,
                insFName: 'A',
                insLName: 'B',
                bio: 'C',
                profilePicture: 'https://example.com/p.png',
            })
        ).rejects.toMatchObject({
            statusCode: 404,
            message: 'User ID 2 not found',
        });
    });

    it('should update and return instructor', async () => {
        const payload = {
            userId: 2,
            insFName: 'A',
            insLName: 'B',
            bio: 'C',
            profilePicture: 'https://example.com/p.png',
        };
        const updated = { instructorId: 7, ...payload };

        InstructorRepository.instructorExists.mockResolvedValue(true);
        UserRepository.userExistsById.mockResolvedValue(true);
        InstructorRepository.updateInstructor.mockResolvedValue(1);
        InstructorRepository.getInstructorById.mockResolvedValue(updated);

        const result = await InstructorService.updateInstructor(7, payload);

        expect(InstructorRepository.updateInstructor).toHaveBeenCalledWith(7, payload);
        expect(result).toEqual(updated);
    });

    it('should return 404 when deleting missing instructor', async () => {
        InstructorRepository.instructorExists.mockResolvedValue(false);

        await expect(InstructorService.deleteInstructor(2)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Instructor ID 2 not found',
        });
    });

    it('should delete instructor when it exists', async () => {
        InstructorRepository.instructorExists.mockResolvedValue(true);

        await InstructorService.deleteInstructor(2);

        expect(InstructorRepository.deleteInstructor).toHaveBeenCalledWith(2);
    });

    it('should return 404 when getting courses for missing instructor', async () => {
        InstructorRepository.instructorExists.mockResolvedValue(false);

        await expect(InstructorService.getInstructorCourses(9)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Instructor ID 9 not found',
        });
    });

    it('should return instructor courses', async () => {
        const courses = [{ course_id: 3 }];
        InstructorRepository.instructorExists.mockResolvedValue(true);
        InstructorRepository.getInstructorCourses.mockResolvedValue(courses);

        const result = await InstructorService.getInstructorCourses(9);

        expect(result).toEqual(courses);
    });
});
