class CategoryDTO {
    constructor(categoryId, categoryName, description) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.description = description;
    }

    static fromEntity(entity) {
        return new CategoryDTO(
            entity.categoryId,
            entity.categoryName,
            entity.description
        );
    }
}

module.exports = CategoryDTO;
