class Category {
    constructor(categoryId, categoryName, description) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.description = description;
    }

    static fromRow(row) {
        return new Category(
            row.category_id,
            row.category_name,
            row.description
        );
    }
}

module.exports = Category;
