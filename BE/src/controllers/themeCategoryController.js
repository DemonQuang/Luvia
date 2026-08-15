import ThemeCategory from "../models/themeCategory.js";

// GET ALL (PUBLIC, ACTIVE ONLY)
export const getAllCategories = async (req, res) => {
    try {
        const categories = await ThemeCategory.find({ status: "active" }).sort({ displayOrder: 1 });
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL FOR ADMIN (INCLUDING INACTIVE)
export const getAdminCategories = async (req, res) => {
    try {
        const categories = await ThemeCategory.find({}).sort({ displayOrder: 1 });
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE (ADMIN)
export const createCategory = async (req, res) => {
    try {
        const { name, slug, icon, displayOrder, status } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ success: false, message: "Name and Slug are required" });
        }

        const existing = await ThemeCategory.findOne({ slug: slug.toLowerCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: "Category slug already exists" });
        }

        const category = await ThemeCategory.create({
            name,
            slug: slug.toLowerCase(),
            icon: icon || "",
            displayOrder: displayOrder || 0,
            status: status || "active"
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE (ADMIN)
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, icon, displayOrder, status } = req.body;

        const category = await ThemeCategory.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        if (slug && slug.toLowerCase() !== category.slug) {
            const existing = await ThemeCategory.findOne({ slug: slug.toLowerCase() });
            if (existing) {
                return res.status(409).json({ success: false, message: "Category slug already exists" });
            }
            category.slug = slug.toLowerCase();
        }

        category.name = name || category.name;
        category.icon = icon !== undefined ? icon : category.icon;
        category.displayOrder = displayOrder !== undefined ? displayOrder : category.displayOrder;
        category.status = status || category.status;

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE (ADMIN)
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await ThemeCategory.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        await category.deleteOne();
        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
