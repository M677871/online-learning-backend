class CourseMaterialDTO {
    constructor(materialId, courseId, title, materialType, filePath, createdAt) {
        this.materialId = materialId;
        this.courseId = courseId;
        this.title = title;
        this.materialType = materialType;
        this.filePath = filePath;
        this.createdAt = createdAt;
    }

    static fromEntity(entity) {
        return new CourseMaterialDTO(
            entity.materialId,
            entity.courseId,
            entity.title,
            entity.materialType,
            entity.filePath,
            entity.createdAt
        );
    }
}

module.exports = CourseMaterialDTO;
