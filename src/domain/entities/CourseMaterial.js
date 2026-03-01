class CourseMaterial {
    constructor(materialId, courseId, title, materialType, filePath, createdAt) {
        this.materialId = materialId;
        this.courseId = courseId;
        this.title = title;
        this.materialType = materialType;
        this.filePath = filePath;
        this.createdAt = createdAt;
    }

    static fromRow(row) {
        return new CourseMaterial(
            row.material_id,
            row.course_id,
            row.title,
            row.material_type,
            row.file_path,
            row.created_at
        );
    }
}

module.exports = CourseMaterial;
